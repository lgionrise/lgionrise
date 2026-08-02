// =============================================================================
// ZEAIPC (Zikr-e-Ameen Innovations & Programming Corporation)
// Project      : ZIKOS 32 - Custom 32-bit RISC-V CPU (RV32IMACF)
// Testbench    : tb_ZIKOS32_Core.v
// Description  : Integration testbench for RegisterFile.v + ALU.v.
//                Verifies:
//                  1. x0 hardwiring (read always 0, writes discarded)
//                  2. Basic register write/read round trip
//                  3. ALU ADD
//                  4. ALU SUB
//                  5. ALU MUL (M-extension)
//                Prints per-test PASS/FAIL and a final summary banner.
// Standard     : Verilog-2001 compatible (runs on Icarus Verilog / ModelSim / VCS)
// =============================================================================

`timescale 1ns / 1ps

module tb_ZIKOS32_Core;

    // -------------------------------------------------------------------
    // DUT Interconnect Signals
    // -------------------------------------------------------------------
    reg         clk;
    reg         rst;

    reg  [4:0]  rs1_addr, rs2_addr, rd_addr;
    reg  [31:0] rd_data;
    reg         reg_write_en;
    wire [31:0] rs1_data, rs2_data;

    reg  [31:0] alu_a, alu_b;
    reg  [4:0]  alu_op;
    wire [31:0] alu_result;
    wire        alu_zero;

    // Bookkeeping for the final summary
    integer test_count;
    integer fail_count;

    // -------------------------------------------------------------------
    // Device Under Test instantiation
    // -------------------------------------------------------------------
    RegisterFile u_regfile (
        .clk          (clk),
        .rst          (rst),
        .rs1_addr     (rs1_addr),
        .rs1_data     (rs1_data),
        .rs2_addr     (rs2_addr),
        .rs2_data     (rs2_data),
        .reg_write_en (reg_write_en),
        .rd_addr      (rd_addr),
        .rd_data      (rd_data)
    );

    ALU u_alu (
        .operand_a (alu_a),
        .operand_b (alu_b),
        .alu_op    (alu_op),
        .result    (alu_result),
        .zero_flag (alu_zero)
    );

    // ALU opcodes mirrored from ALU.v for use in this testbench
    localparam [4:0] ALU_ADD = 5'b00000;
    localparam [4:0] ALU_SUB = 5'b00001;
    localparam [4:0] ALU_MUL = 5'b01010;

    // -------------------------------------------------------------------
    // Clock generation: 10ns period (100MHz)
    // -------------------------------------------------------------------
    initial clk = 1'b0;
    always #5 clk = ~clk;

    // -------------------------------------------------------------------
    // Reusable task: write a value into the register file and confirm
    // the write completed on the following clock edge.
    // -------------------------------------------------------------------
    task write_reg;
        input [4:0]  addr;
        input [31:0] data;
        begin
            @(negedge clk);
            rd_addr      = addr;
            rd_data      = data;
            reg_write_en = 1'b1;
            @(negedge clk);
            reg_write_en = 1'b0;
        end
    endtask

    // -------------------------------------------------------------------
    // Reusable task: compare an actual value against an expected value,
    // print a labeled PASS/FAIL line, and update the summary counters.
    // -------------------------------------------------------------------
    task check_result;
        input [255:0] test_name; // ASCII label, room for a long string
        input [31:0]  actual;
        input [31:0]  expected;
        begin
            test_count = test_count + 1;
            if (actual === expected) begin
                $display("[PASS] %0s | actual=0x%08h expected=0x%08h", test_name, actual, expected);
            end
            else begin
                fail_count = fail_count + 1;
                $display("[FAIL] %0s | actual=0x%08h expected=0x%08h", test_name, actual, expected);
            end
        end
    endtask

    // -------------------------------------------------------------------
    // Main test sequence
    // -------------------------------------------------------------------
    initial begin
        // Waveform dump for debugging in GTKWave / ModelSim
        $dumpfile("tb_ZIKOS32_Core.vcd");
        $dumpvars(0, tb_ZIKOS32_Core);

        test_count   = 0;
        fail_count   = 0;
        rst          = 1'b1;
        reg_write_en = 1'b0;
        rs1_addr     = 5'd0;
        rs2_addr     = 5'd0;
        rd_addr      = 5'd0;
        rd_data      = 32'd0;
        alu_a        = 32'd0;
        alu_b        = 32'd0;
        alu_op       = ALU_ADD;

        $display("=====================================================");
        $display(" ZEAIPC - ZIKOS 32  |  RegisterFile + ALU Testbench");
        $display("=====================================================");

        // Hold reset for a couple of cycles, then release
        @(negedge clk);
        @(negedge clk);
        rst = 1'b0;
        @(negedge clk);

        // ---------------------------------------------------------------
        // TEST 1: x0 hardwiring - attempt to write x0, confirm read is 0
        // ---------------------------------------------------------------
        write_reg(5'd0, 32'hDEAD_BEEF);
        rs1_addr = 5'd0;
        #1; // allow async read to settle
        check_result("x0 Hardwire Read", rs1_data, 32'h0000_0000);

        // ---------------------------------------------------------------
        // TEST 2: Basic register write/read round trip (x5 = 0x0000_0064)
        // ---------------------------------------------------------------
        write_reg(5'd5, 32'h0000_0064); // x5 = 100
        rs1_addr = 5'd5;
        #1;
        check_result("Register x5 Write/Read", rs1_data, 32'h0000_0064);

        // Also load x6 = 25 for use as the second ALU operand below
        write_reg(5'd6, 32'h0000_0019); // x6 = 25
        rs2_addr = 5'd6;
        #1;

        // ---------------------------------------------------------------
        // TEST 3: ALU ADD  -> x5 + x6 = 100 + 25 = 125
        // ---------------------------------------------------------------
        alu_a  = rs1_data; // 100
        alu_b  = rs2_data; // 25
        alu_op = ALU_ADD;
        #1;
        check_result("ALU ADD (100 + 25)", alu_result, 32'd125);

        // ---------------------------------------------------------------
        // TEST 4: ALU SUB  -> x5 - x6 = 100 - 25 = 75
        // ---------------------------------------------------------------
        alu_op = ALU_SUB;
        #1;
        check_result("ALU SUB (100 - 25)", alu_result, 32'd75);

        // ---------------------------------------------------------------
        // TEST 5: ALU MUL (M-extension) -> x5 * x6 = 100 * 25 = 2500
        // ---------------------------------------------------------------
        alu_op = ALU_MUL;
        #1;
        check_result("ALU MUL (100 * 25)", alu_result, 32'd2500);

        // ---------------------------------------------------------------
        // TEST 6: Confirm writes to x0 never persist even after other
        // register file activity has occurred (regression against latch bugs)
        // ---------------------------------------------------------------
        write_reg(5'd0, 32'hFFFF_FFFF);
        rs1_addr = 5'd0;
        #1;
        check_result("x0 Hardwire After Activity", rs1_data, 32'h0000_0000);

        // ---------------------------------------------------------------
        // Final summary banner
        // ---------------------------------------------------------------
        $display("=====================================================");
        if (fail_count == 0) begin
            $display(" RESULT: TEST PASSED  (%0d/%0d checks passed)", test_count, test_count);
        end
        else begin
            $display(" RESULT: TEST FAILED  (%0d/%0d checks failed)", fail_count, test_count);
        end
        $display("=====================================================");

        $finish;
    end

endmodule
