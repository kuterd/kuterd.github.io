  <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js"></script>
  <script>
      /* QUICK and DIRTY code */
      var editor = null;
      function dec2bin(dec, length) {
        let result = dec.toString(2);
        return "0".repeat(length - result.length) + result
      }

      function update() {
        let value = editor.getValue();
        var lines = value.split("\n");

        var start = 0;


        let instructions = [];
        let encoded = [];
        lines.forEach(function (line, i) {
          line = line.trim();

          if (!line.startsWith("/*")) {
            start = i;
            return;
          }
          var after_comment = line.substring(line.indexOf("*/") + 2).trim();
          if (after_comment.length != 0) {
            var hex = after_comment.substring(after_comment.indexOf("/*") + 2, after_comment.length - 2).trim();
            var assembly = after_comment.substring(0, after_comment.indexOf("/*"));
            instructions.push(assembly);
            encoded.push([hex]);
          } else {
            var hex = line.substring(line.indexOf("/*") + 2, line.length - 2).trim();
            encoded[encoded.length-1].push(hex);
          }
        });

        let resultEl = document.getElementById("result");
        var result = "<table>";
        let rows = ["instruction", "stall", "yield", "write_barrier", "read_barrier", "barrier_mask", "reuse", "unused"];

        result+= "<tr>"
        rows.forEach(function(e) {
          result += "<th>" + e + "</th>"
        })
        result += "</tr>"

        for (var i = 0; i < instructions.length; i++) {
          if (encoded[i].length != 2) {
            result += "<tr></tr>";
            continue;
          }

          let a = encoded[i][1].substr(2,2*3);
          console.log(a)
          a = parseInt(a, 16);

          let stall = (a >> 1) & 0b1111;
          let yield = (a >> 5) & 0b1;
          let write_barrier = (a >> 6) & 0b111;
          let read_barrier = (a >> 9) & 0b111;
          let barrier_mask = dec2bin((a >> 12) & 0b111111);
          let reuse = dec2bin((a >> 18) & 0b1111, 4)
          let unused = dec2bin((a >> 22) & 0b11, 2) + "-" + dec2bin((a & 0b1), 1);
          let instruction = instructions[i];

          let rows = [instruction, stall, yield, write_barrier, read_barrier, dec2bin(barrier_mask, 6), dec2bin(reuse, 4), unused];

          result+= "<tr>"
          rows.forEach(function(e) {
            result += "<td>" + e + "</td>"
          })

          result += "</tr>"
        }
        result += "</table>";
        resultEl.innerHTML = result;
      }

      document.addEventListener("DOMContentLoaded", function() {
          editor = ace.edit("editor");
          editor.setTheme("ace/theme/monokai");
          editor.session.setMode("ace/mode/c_cpp");
          editor.session.on('change', function (delta) {
            update();
          });
          update();
      });
  </script>
  <style>
    #center {
        max-width: 1500px;
    }

    #modal-container {
        display: flex;
        flex-direction: row;
        width:100%;
        height: 600px;
    }

    #editor, #result {
        flex: 1;
        font-size: 13px;
    }


    #result {
        overflow: scroll;
    }

    #result table {
        border: 0;
    }
    #result td {
        padding: 3px;
    }
</style>

Paste your cuobjdump SASS output to the left and the table in the right will update automatically. Make sure the disassembly has the raw byte sequence in comments `/* 0x... */`.

For more info on NVIDIA control codes, please read; [Dissecting the NVIDIA Volta GPU Architecture via Microbenchmarking](https://arxiv.org/abs/1804.06826), [Optimizing batched winograd convolution on GPUs](https://www.cse.ust.hk/~weiwa/papers/yan-ppopp20.pdf) and [NervenaSystems MaxAs wiki Control-Codes page](https://github.com/NervanaSystems/maxas/wiki/Control-Codes)

<div id="modal-container">
    <div id="editor">
    /*0000*/                   LDC R1, c[0x0][0x28] ;                                             /* 0x00000a00ff017b82 */
                                                                                                  /* 0x000e220000000800 */
    /*0010*/                   S2R R25, SR_TID.X ;                                                /* 0x0000000000197919 */
                                                                                                  /* 0x000e620000002100 */
    /*0020*/                   ULDC UR6, c[0x0][0x220] ;                                          /* 0x0000880000067ab9 */
                                                                                                  /* 0x000fe20000000800 */
    /*0030*/                   ULDC.64 UR4, c[0x0][0x240] ;                                       /* 0x0000900000047ab9 */
                                                                                                  /* 0x000fe20000000a00 */
    /*0040*/                   UISETP.GT.AND UP0, UPT, UR6, 0x4, UPT ;                            /* 0x000000040600788c */
                                                                                                  /* 0x000fe2000bf04270 */
    /*0050*/                   IADD3 R1, R1, -0x68, RZ ;                                          /* 0xffffff9801017810 */
                                                                                                  /* 0x001fe20007ffe0ff */
    /*0060*/                   UIMAD UR4, UR4, UR5, URZ ;                                         /* 0x00000005040472a4 */
                                                                                                  /* 0x000fc6000f8e023f */
    /*0070*/                   ULDC UR5, c[0x0][0x248] ;                                          /* 0x0000920000057ab9 */
                                                                                                  /* 0x000fe40000000800 */
    /*0080*/                   USEL UR5, UR5, 0x1, UP0 ;                                          /* 0x0000000105057887 */
                                                                                                  /* 0x000fc80008000000 */
    </div>
    <div id="result"></div>
</div>
