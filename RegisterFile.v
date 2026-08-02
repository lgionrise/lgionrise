// =============================================================================
// ZEAIPC (Zikr-e-Ameen Innovations & Programming Corporation)
// Project      : ZIKOS 32 - Custom 32-bit RISC-V CPU (RV32IMACF)
// Module       : RegisterFile.v
// Description  : General Purpose Register File for the ZIKOS 32 5-stage pipeline
//                - 32 x 32-bit registers (x0 - x31)
//                - x0 is hardwired to zero per the RISC-V ISA specification
//                - 2 asynchronous (combinational) read ports  : rs1, rs2
//                - 1 synchronous (clocked) write port         : rd
// Standard     : IEEE 1364-2001 (Verilog-2001)
// Target       : SkyWater 130nm (Google OpenMPW) / FPGA prototyping
// =============================================================================

`timescale 1ns / 1ps

module RegisterFile (
    input  wire        clk,          // System clock
    input  wire         rst,          // Active-high synchronous reset

    // Read Port 1
    input  wire [4:0]  rs1_addr,     // Source register 1 address
    output wire [31:0] rs1_data,     // Source register 1 data (async read)

    // Read Port 2
    input  wire [4:0]  rs2_addr,     // Source register 2 address
    output wire [31:0] rs2_data,     // Source register 2 data (async read)

    // Write Port
    input  wire         reg_write_en, // Write enable, asserted during Writeback
    input  wire [4:0]  rd_addr,      // Destination register address
    input  wire [31:0] rd_data       // Destination register write data
);

    // -------------------------------------------------------------------
    // Register Array
    // -------------------------------------------------------------------
    // 32 general purpose registers, each 32 bits wide.
    // regfile[0] is architecturally reserved as the constant zero register
    // and is never actually driven by writes (enforced below).
    // -------------------------------------------------------------------
    reg [31:0] regfile [0:31];

    integer i;

    // -------------------------------------------------------------------
    // Synchronous Write Port (Writeback Stage)
    // -------------------------------------------------------------------
    // On reset, all registers are cleared to 0 for a clean, deterministic
    // simulation/bring-up state. During normal operation, a write only
    // occurs when reg_write_en is high AND the destination is NOT x0.
    // Writes to x0 are silently discarded per the RISC-V spec: x0 must
    // always read as zero, regardless of what is written to it.
    // -------------------------------------------------------------------
    always @(posedge clk) begin
        if (rst) begin
            for (i = 0; i < 32; i = i + 1) begin
                regfile[i] <= 32'h0000_0000;
            end
        end
        else if (reg_write_en && (rd_addr != 5'd0)) begin
            regfile[rd_addr] <= rd_data;
        end
    end

    // -------------------------------------------------------------------
    // Asynchronous (Combinational) Read Ports
    // -------------------------------------------------------------------
    // Reads are purely combinational (no clock edge) so operands are
    // available to the Execute stage within the same cycle they are
    // fetched in Decode. x0 is hardwired to return 32'b0 unconditionally,
    // regardless of the contents of regfile[0] (defense in depth, since
    // writes to regfile[0] are already blocked above).
    // -------------------------------------------------------------------
    assign rs1_data = (rs1_addr == 5'd0) ? 32'h0000_0000 : regfile[rs1_addr];
    assign rs2_data = (rs2_addr == 5'd0) ? 32'h0000_0000 : regfile[rs2_addr];

endmodule
