
I made a Python bytecode & AST (Abstract Syntaxt Tree) explorer, it's similar to [Godbolt Compiler Explorer](https://godbolt.org/). Also all the parsing and bytecode compilation is done on browser using [Pyodide](https://pyodide.org)!

Paste or type your code to the left side and you are going to be able to view the AST or bytecode on the right side.

<script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js" type="text/javascript" charset="utf-8"></script>

<style>
    #center {
        max-width: 1500px;
    }
    .editors {
      display: flex;
      flex-direction: row;
      width: 100%;
      margin:auto;
      height: 600px; /* Or set to any desired height */
    }

    .editor {
      flex: 1; /* Each editor takes equal space */
      height: 100%;
    }
    .selector-holder {
        height: 40px;
        line-height: 40px;
        white-space-collapsing: discard;
        background-color: #212121;
        border-radius: 0px 10px 0px 0px;
    }

    .selector-holder > div {
    
        display: inline-block;
        height: 100%;
        border-radius: 10px 10px 0px 0px;
        padding-left: 10px;
        padding-right: 10px;
        margin-top: 5px;
    }

    .selector-holder > div:hover {
        cursor: pointer;
    }

    .selector-holder > div.active {
        background-color: #42423f;
    }
</style>

 <div class="main-holder">
  <div class="editors">
    <div id="editor" class="editor"># Type your code here,
# the bytecode will be displayed on the right automatically.
for i in range(5):
    print("Hello world")
    </div>
    <div class="editor">
        <div class="selector-holder">
            <div id="show-bytecode" class="active">Show Bytecode</div>
            <div id="show-ast">Show AST</div>
        </div>
        <div id="output" style="height: 560px"># Loading Pyodide ... </div>
    </div>
  </div>
</div>
<script type="text/javascript">
    var options = document.getElementsByClassName("selector-holder")[0].children;
    console.log(options);
    var show_ast = false;
    function reset_active() {
        for (let i = 0; i < options.length; i++) {
            let option = options[i];
            option.className = "";
        }
    }
    for (let i = 0; i < options.length; i++) {
        let option = options[i];
        console.log(option.id);
        option.addEventListener("click", (function () {
            reset_active();
            this.className = "active";
            show_ast = this.id == "show-ast";
            update_bytecode();
        }).bind(option));
    }

    let editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/python");
    editor.session.on('change', function (delta) {
      console.log("Editor Changed")
      update_bytecode();
    });

    let output_editor = ace.edit("output");
    output_editor.setTheme("ace/theme/monokai");
    output_editor.session.setMode("ace/mode/python");
    output_editor.setReadOnly(true);
    var pyodide_future = loadPyodide();

    async function update_bytecode() {
      let output_el = document.getElementById("output");
      pyodide = await pyodide_future;
      globals = {
        "code_input": editor.getValue()
      }
      let show_bytecode_source = `
        import io
        import dis
        buffer = io.StringIO()
        result = ""
        try:
          code_object = compile(code_input, '<string>', 'exec')
          dis.dis(code_object, file=buffer)
          result = buffer.getvalue()
        except:
          result = "Syntax Error"
        result
      `;

      let show_ast_source = `
        import ast
        result = ""
        try:
            result = ast.dump(ast.parse(code_input), indent=4)
        except:
            result = "Syntact Error"
        result
      `;

      let source = show_ast ? show_ast_source : show_bytecode_source;

      result = pyodide.runPython(source, { "globals": pyodide.toPy(globals), "locals": pyodide.toPy({}) })
      output_editor.setValue(result);
      output_editor.clearSelection();
    }
    update_bytecode(false);
</script>
