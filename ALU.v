// =============================================================================
// ZEAIPC (Zikr-e-Ameen Innovations & Programming Corporation)
// Project      : ZIKOS 32 - Custom 32-bit RISC-V CPU (RV32IMACF)
// Module       : ALU.v
// Description  : Arithmetic Logic Unit for the ZIKOS 32 Execute stage.
//                Supports the full base 'I' integer ALU operation set plus
//                the 'M' extension (integer multiply / divide / remainder).
// Standard     : IEEE 1364-2001 (Verilog-2001)
// Target       : SkyWater 130nm (Google OpenMPW) / FPGA prototyping
//
// NOTE ON DIV/REM: For simulation and FPGA prototyping this ALU implements
// DIV/DIVU/REM/REMU combinationally using the native Verilog '/' and '%'
// operators. On FPGA targets these synthesize to vendor multi-cycle divider
// IP; on ASIC (130nm) this block MUST be replaced with (or wrapped around)
// a sequential radix-2/radix-4 restoring divider before tape-out, since a
// combinational divider is not timing-closable at any reasonable clock
// frequency. This is flagged here as a known Phase-2 hardening item.
// =============================================================================

`timescale 1ns / 1ps

module ALU (
    input  wire [31:0] operand_a,   // First ALU operand (rs1)
    input  wire [31:0] operand_b,   // Second ALU operand (rs2 or immediate)
    input  wire [4:0]  alu_op,      // ALU operation select (see localparams below)
    output reg  [31:0] result,      // ALU result
    output wire         zero_flag    // High when result == 0 (used for branches)
);

    // -------------------------------------------------------------------
    // ALU Operation Opcodes (localparam for readability / maintainability)
    // -------------------------------------------------------------------
    // Base 'I' extension operations
    localparam [4:0] ALU_ADD   = 5'b00000; // operand_a + operand_b
    localparam [4:0] ALU_SUB   = 5'b00001; // operand_a - operand_b
    localparam [4:0] ALU_AND   = 5'b00010; // operand_a & operand_b
    localparam [4:0] ALU_OR    = 5'b00011; // operand_a | operand_b
    localparam [4:0] ALU_XOR   = 5'b00100; // operand_a ^ operand_b
    localparam [4:0] ALU_SLL   = 5'b00101; // operand_a << operand_b[4:0]
    localparam [4:0] ALU_SRL   = 5'b00110; // operand_a >> operand_b[4:0] (logical)
    localparam [4:0] ALU_SRA   = 5'b00111; // operand_a >>> operand_b[4:0] (arithmetic)
    localparam [4:0] ALU_SLT   = 5'b01000; // signed   (operand_a < operand_b) ? 1 : 0
    localparam [4:0] ALU_SLTU  = 5'b01001; // unsigned (operand_a < operand_b) ? 1 : 0

    // 'M' extension operations
    localparam [4:0] ALU_MUL    = 5'b01010; // signed x signed,   lower 32 bits
    localparam [4:0] ALU_MULH   = 5'b01011; // signed x signed,   upper 32 bits
    localparam [4:0] ALU_MULHSU = 5'b01100; // signed x unsigned, upper 32 bits
    localparam [4:0] ALU_MULHU  = 5'b01101; // unsigned x unsigned, upper 32 bits
    localparam [4:0] ALU_DIV    = 5'b01110; // signed division
    localparam [4:0] ALU_DIVU   = 5'b01111; // unsigned division
    localparam [4:0] ALU_REM    = 5'b10000; // signed remainder
    localparam [4:0] ALU_REMU   = 5'b10001; // unsigned remainder

    // -------------------------------------------------------------------
    // Internal signed views of the operands (required for SLT / MULH* / DIV / REM)
    // -------------------------------------------------------------------
    wire signed [31:0] signed_a = operand_a;
    wire signed [31:0] signed_b = operand_b;

    // 64-bit signed/unsigned product terms for the MUL* family.
    wire signed [63:0] mul_signed_signed     = signed_a * signed_b;
    wire        [63:0] mul_unsigned_unsigned = operand_a * operand_b;
    // MULHSU: operand_a is signed, operand_b is unsigned. Sign-extend operand_a
    // to 64 bits, zero-extend operand_b to 64 bits, then multiply.
    wire signed [63:0] mul_signed_unsigned   = signed_a * $signed({1'b0, operand_b});

    // -------------------------------------------------------------------
    // Main combinational ALU logic
    // -------------------------------------------------------------------
    // Full case coverage with a default branch guarantees no unintended
    // latch inference (result is always assigned on every path).
    // -------------------------------------------------------------------
    always @(*) begin
        case (alu_op)
            // ---------------- Base Integer ('I') Ops ----------------
            ALU_ADD:  result = operand_a + operand_b;
            ALU_SUB:  result = operand_a - operand_b;
            ALU_AND:  result = operand_a & operand_b;
            ALU_OR:   result = operand_a | operand_b;
            ALU_XOR:  result = operand_a ^ operand_b;

            // Shift amount is the lower 5 bits of operand_b (RV32 rule)
            ALU_SLL:  result = operand_a << operand_b[4:0];
            ALU_SRL:  result = operand_a >> operand_b[4:0];
            ALU_SRA:  result = $unsigned(signed_a >>> operand_b[4:0]);

            ALU_SLT:  result = (signed_a < signed_b) ? 32'd1 : 32'd0;
            ALU_SLTU: result = (operand_a < operand_b) ? 32'd1 : 32'd0;

            // ---------------- Multiply ('M') Ops ----------------
            ALU_MUL:    result = mul_signed_signed[31:0];
            ALU_MULH:   result = mul_signed_signed[63:32];
            ALU_MULHSU: result = mul_signed_unsigned[63:32];
            ALU_MULHU:  result = mul_unsigned_unsigned[63:32];

            // ---------------- Divide / Remainder ('M') Ops ----------------
            // RISC-V spec-mandated special cases:
            //   Division by zero   : DIV/DIVU return all-ones (-1), REM/REMU
            //                        return the dividend unchanged.
            //   Signed overflow    : (most-negative-int) / (-1) returns the
            //                        most-negative-int, remainder returns 0.
            ALU_DIV: begin
                if (operand_b == 32'h0000_0000)
                    result = 32'hFFFF_FFFF;
                else if (signed_a == 32'h8000_0000 && signed_b == -32'sd1)
                    result = 32'h8000_0000;
                else
                    result = signed_a / signed_b;
            end

            ALU_DIVU: begin
                if (operand_b == 32'h0000_0000)
                    result = 32'hFFFF_FFFF;
                else
                    result = operand_a / operand_b;
            end

            ALU_REM: begin
                if (operand_b == 32'h0000_0000)
                    result = operand_a;
                else if (signed_a == 32'h8000_0000 && signed_b == -32'sd1)
                    result = 32'h0000_0000;
                else
                    result = signed_a % signed_b;
            end

            ALU_REMU: begin
                if (operand_b == 32'h0000_0000)
                    result = operand_a;
                else
                    result = operand_a % operand_b;
            end

            // Safety default: prevents inferred latches for undefined alu_op codes
            default: result = 32'h0000_0000;
        endcase
    end

    // Zero flag is combinational and derived directly from the result,
    // used by the Execute stage for BEQ/BNE branch resolution.
    assign zero_flag = (result == 32'h0000_0000);

endmodule
