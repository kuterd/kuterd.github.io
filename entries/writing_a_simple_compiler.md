Personally, I love how writing compilers requires a combination of both practical and theoretical knowledge.

In this project we will be building a jit compiler for a very small subset of C to gain confidence in recursive descent parsing and generating machine code programmatically. I wanted to build the most basic compiler that I can. I think it is often important to build the most simplest solution to problem before developing more complicated solutions. Building the simplest compiler will show us some of the problems we are going to encounter with more advanced compilers. 

As a side note, I am currently building a more complicated compiler that uses the __Single Static Assignment__ form and also does proper-ish register allocation, I will try to write about some of the algorithms that I implemented when I finish it, but it still needs a lot of work.
 
!!! note "__Mandatory warning__: If you just want to create your own programming language and don't care too much about making something from scratch, You are better of just writing a [LLVM](https://llvm.org/) Frontend. LLVM Can generate really beautiful optimized code. Instead of the horribly inefficient machine code we will generate. The section on recursive descent parsing would still be useful for you though."

[TOC]

## The basic anatomy of a compiler

We don't really have to worry about any of this, this is just to give you an idea, may be slightly inaccurate.

* __Tokenization & Parsing__ (we can consider tokenization and parsing as a single step).
* __Intermediate Representation Construction__ The intermediate representation is how the compiler represents the program internally.
* __Usually Some Optimizations__  Where the compiler makes changes to the program to make it run faster without changing the defined behavior of the program(hopefully :D).
* __Legalization__ Usually some of the architecture specific quirks needs to be handled before instruction selection. 
* __Instruction Selection__ Where the compiler selects which architecture specific instructions to use to represent the program.
* __Register Allocation__ Usually there is no limit on how many variables we can have in a program, however there are limited number of hardware registers available. This is the stage where we store some variables in memory loading them back to registers when they are needed.
* __Instruction Encoding__ Encode all instructions into a byte stream getting the program ready to be read by the cpu.
* __Static Linking__ We don't know addresses of all functions before encoding the program, Since the offsets of functions depend on the sizes of instructions which which we usually don't know in advance. 
* __JIT execution, executable file or module creation__

Hopefully, I will go over each of these steps in the future but now let's take a look at how the our most basic compiler is going to look like.

## Anatomy of our simple compiler 
We can combine most of the steps above into a single step, and skip a few of them (at the cost of quality of the code generated of course)

* __Parsing & Instruction Selection & encoding__ We will combine parsing and code generation into a single step.
* __Simple Linking__ We will have a very simple linking step at the end. 
* __JIT execution__ It's easier to do jit execution instead of creating an executable file.

This is it !

The simplifications of our compiler (Micro C) 

* Horribly inefficient machine code generation.
* No types, every type is a 64-bit integer, floating point numbers and structs are not supported.
* Every value is stored in stack, registers are not utilized properly.
* No [Intermediate Representation](https://en.wikipedia.org/wiki/Intermediate_representation) or [Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree). Code generation combined with parsing.

Please note that these simplifications significantly reduces the quality of the code that we generate. Modern compilers are often millions of lines of code compared to our ~1000 lines.

## Tokenization(Lexing)

It's  useful that we think of the code as a series of tokens. Tokens are like words. We essentially assign each token a class like; identifier, number, left parenthesis, right parenthesis, operator etc. This helps us understand the contents of code (which is just text) and makes it easier for us to parse it later.

Essentially tokenizer takes in text in the __form of:__
```c
    asd () {

    }
```

__And outputs:__
```
{<identifier(asd)>, <l_paran>, <r_paran>, <l_brace>, <r_brace> ... }
```
That's easier to understand than `{'a', 's', 'd', ' ', '(', ')', ...}` right ?

Sometimes it may be favorable to have the tokenizer as a separate competent, especially if it involves complex logic. Since my tokenizer only needs one character to determine token type in most cases, I opted to not have a separate tokenizer and just __combined tokenization and parsing__. 

__To give an example on how we can combine tokenization and parsing:__ 
```C
    parse_atom(reader) {
        char c = **reader;

        if (c >= '0' && c <= '9') { // is this a number token ?
            uint64_t number = read_int(reader);
            // Materialize the constant number.
            ...
        } else if (c == '"') { // is this a string token ? 
            char *string = parse_string(reader);
            // Materialize the string pointer as a constant.
            ...
        } else if (c == '(') { // left parenthesis token.
            // Parse expression inside parenthesis 
        }
    }
```
It's as simple as that !

## Recursive descent parsing

Most modern compilers (clang, gcc, etc) doesn't use parser generators and instead use handwritten(🧿)  recursive descent parsers. I think once it "clicks" in your mind it be trivial to write any recursive descent parser you want !

For example let's imagine that a function can be defined like in the example below.

```C
asd (a, b) {
    ...
}
```

__We can parse it like this:__

```C
    parse_function_declaration (reader) {
        char *function_name = read_ident(reader); // read an identifier, consisting of lower case or upper case characters. 
        skip_whitespace(); // Skip any whitespace character.
        assert_compilation(**reader == '(');
        (*reader)++; // skip the '('.

        size_t argCount = 0;
        argument_info_t arguments[MAX_ARGUMENTS];
        // Parse the argument list.
        bool first_arg = true;
        while (**reader != ')') {
            // If this is the first argument, we don't expect to have a comma here since commas go between arguments.
            if (!first_arg) {
                assert_compilation(**reader == ',');  // check the comma separation for the argument list.
                (*reader)++;
            } else {
                first_arg = false;
            }
            ...
            arguments[argCount++] = parse_arg(reader);  // Parse the name of the argument.
            ...
        }
        ...

        parse_code_block(reader);

    }
```
Well, that was simple enough right ? If not, keep in mind that you can go over the finished code with a debugger, I am sure that will help. 

### Operator Precedence Parsing (and very cool parsing animation demo)
I think the most of difficult part of parsing is to get operator precedence parsing right.

`123 + 10 * 5 + 120 / 2` should be parsed as `123 + (10 * 5) + (120 / 2)` not as `((123 + 10) * 5) + 120) / 2`.

<script src="parser-viz.js"></script>
<style>
    #parse-expression {
        margin-left: 5px;
        padding-left:10px;
        padding-right:10px;
        font-weight: bold;
        width: 100px;
        color: black;
    }
    #parser-button-holder input {
        padding: 5px;
        width: 100%;
    }

    #parser-button-holder {
        margin-bottom: 10px;
        display: flex;
        flex-direction: row;
    }

    .visualization-holder {
        margin: auto;
        width: 500px;
    }

    input {
        color: black;
    }

    @media screen and (max-width: 500px) {
        .visualization-holder {
            width: 100% !important;
        }

        #canvas {
            width: 100%;
        }
    }
</style>
<div class="visualization-holder">
    <div id="parser-button-holder">
    <input type="text" id="expression-input" value="10 * 20 + 11 * 21 + 23 / (10 + 20)"/>
    <button id="parse-expression">Parse !</button>
    </div>
    <canvas id="canvas">Whoa Horsey, Your browser sadly doesn't support html canvas elements.</canvas>
    <p style="color: #7cf2f4; font-style: italic">I made a very cool demo that demonstrates operator precedence parsing, make sure you try it (I spent way too much time on it, so pls try it lol).<p>
</div>

!!! note "In the demo above examine how combining different operators result in different parse trees, try an expression with parentheses. Please note that only simple expressions with numbers are supported."


#### Simple operator precedence parsing

Let's start by writing a function to only parse multiplication and division operations. Since both multiplication and division have the same precedence, we just have to ensure that it's parsed left to right.
Also we have to consider that a number by itself is a valid expression(like "123"). Meaning that we need to be able to handle that case as well. We will return if we ever see a operator that is not the correct precedence level.

```C
// Parse multiplication, division or just an atom value.
parse_multiply (reader) {
    left = parse_atom(reader);
    while (1) { // keep parsing until we reach eof or different operator precedence.
        skip_whitespace(reader);
        
        char op = **reader;

        // Not the correct operator precedence or End of File.
        if (op == 0 || (op != '*' && op != '/'))
            break;
        
        skip_whitespace(reader);

        right = parse_atom(reader);

        // "multiply" or "divide" functions here could either mean evaluating the value or emitting assembly.
        if (op == '*')
            left = multiply(left, right);
        else if (op == '/')
            left = divide(left, right);
    }

    return left;
}
```
Now let's handle parsing additions and subtractions. We need to be able to handle "10 * 20 + 10".

``` C
// Parse addition or subtraction.
parse_add (reader) {
    // Important: We call the parse_multiply function to handle higher precedence operators.
    left = parse_multiply(reader);
    while (1) {
        skip_whitespace(reader);
        
        char op = **reader;

        // Check if not the correct operator precedence or End of File.
        if (op == 0 || (op != '+' && op != '-'))
            break;
        
        skip_whitespace(reader);
        // Important: We call the parse_multiply function to handle higher precedence operators.
        right = parse_multiply(reader);

        // "add" or "subtract" functions here could either mean evaluating the value or emitting assembly.
        if (op == '+')
            left = add(left, right);
        else if (op == '-')
            left = subtract(left, right);
    }

    return left;
}
```

!!! note "Using what you have learned so far, you can try to create a calculator program that takes in a expression like '33 / (10 + 23)' calculates the result."

#### Generalized operator precedence parsing and compilation
As you might have seen, the `parse_multiply` and `parse_add` functions share too much in common, and since we will have multiple levels of operator precedences, our code would get really ugly real quick.
We can generalize the binary operator parsing such that it's very easy to add new operators.

```C

// A compile operator function takes in stack positions of it's arguments and returns the stack position of it's result.
typedef slot_t (*compile_operator_t)(slot_t a, slot_t b);


typedef struct  {
    char *op_string;
    size_t precedence;
    compile_operator_t compile_op; // this a function pointer.
} bin_operator_t;

bin_operator_t bin_operators[] = {
    {.op_string="*", .precedence=3, .compile_op=compile_mul},
    {.op_string="/", .precedence=3, .compile_op=compile_div},
    {.op_string="+", .precedence=2, .compile_op=compile_add},
    {.op_string="-", .precedence=2, .compile_op=compile_sub},
    {.op_string="<", .precedence=1, .compile_op=compile_less},
    {.op_string=">", .precedence=1, .compile_op=compile_greater},
    ...
    {.op_string="&", .precedence=0, .compile_op=compile_and},
    {.op_string="|", .precedence=0, .compile_op=compile_or},
    ...
};

compile_expression_(reader, precedence) {
    skip_whitespace(reader);
    if (precedence == MAX_PRECEDENCE)
        return parse_atom(reader);
    
    slot_t left = compile_expression_(current, precedence + 1);
    
    while (1) {
        skip_whitespace(current);
        char op = **current;
        if (op == 0)
            return left;
        
        char nOP = *(*current + 1);

        compile_operator_t compile_op_fun = NULL;
        // Go over each operator and check if the current operator.
        // Would have been better if used a hash map here, but I want to limit the lines of code.
        for (size_t i = 0; i < sizeof(bin_operators) / sizeof(bin_operator_t); i++) {
            bin_operator_t *operator = &bin_operators[i];

            // Every operator is either one or two characters long. 
            if (operator->op_string[0] != op || (IS_OPERATOR_CONTINUATION(nOP) && operator->op_string[1] != nOP))
                continue;

            // Operator found, check precedence.
            if (operator->precedence != precedence)
                break; // not the correct precedence.

            // Operator and precedence matches.
            compile_op_fun = operator->compile_op;
            (*current)++;
            if (operator->op_string[1] != 0)
                (*current)++;
        }

        if (compile_op_fun == NULL)
            return left;

        slot_t right = compile_expression_(current, precedence + 1);
        left = compile_op_fun(result, right); // Call the compile function for this op to generate assembly and return the stack slot of the resulting value.
    }
}
```

The `parse_atom` function parses a int, string, expression in parenthesis. For int and string values, the ` parse_atom` function emits assembly to store the constant value in stack and returns the stack position corresponding to the position where the value is stored.

As described in the comments `compile_operator_t` is a function pointer that takes in stack positions of input values and generates assembly to do the operation, and returns the stack slot where the result value will be stored.

# Allocating Executable memory
The processor will reject to execute code located in pages that are not marked as executable, and under normal circumstances the memory that we allocate is not marked as executable. This is a security feature to try to make it more difficult to build exploits.
We need to ask the kernel specifically to map executable memory to our process.

This is how you do it linux:
```c
    void* result = mmap(
       NULL,
       allocSize,
       PROT_READ | PROT_WRITE | PROT_EXEC,
       MAP_ANONYMOUS | MAP_PRIVATE,
       -1,
       0
    );
```

# Encoding X86-64(Also known as IA-64 or amd64) instructions

Please note that I will try to port the code to arm whenever I have time. But I wanted to start with x86.

The x86 architecture has it's roots to 1970's. And a modern x86 CPU can still execute an 16-bit operating system that was build in 1980's. Being so old and so backwards compatible does have some caveats. Encoding x86 instructions is kinda __difficult__ and frankly it took me a long time to understand.

Intel's [Architecture Software Developer Manual](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html) describes the x86 architecture in detail, including how to encode each instructions. I strongly suggest that you take a look because I won't go over how each instruction we use is encoded.

Let's take a look at how to encode a simple `ADD` instruction. The `ADD` instruction is listed under  Chapter 3 of the Volume 2 of the Architecture Software Developer Manual.  We can see that there is a table.

 Opcode             | Instructions      
--------------------|-------------------
 04 ib              | ADD AL, imm8      
 05 iw              | ADD AX, imm16     
 ...                | ...               
 01 /r              | ADD r/m16, r16    
 01 /r              | ADD r/m32, r32    
 REX.W + 01 /r      | ADD r/m64, r64    
 ...                | ...               

!!! note "I  suggest that you take look at Chapter 2 of Architecture Software Developer which describes the instruction format and also the first part of Chapter 3 which describes how to interpret the instruction listings."

We are specifically interested in the `ADD r/m64, r64` variation of the instruction. `r/m64` means that one of the operands is ModRM which I will explain later. And `r64` means that the other operand is a 64-bit register.

And although we can guess that 01 means 0x01 in hex what does `/r` mean, "/r" means that the second register operand is encoded as a part of the ModRM byte. 

Also here seems to be 3 different instructions that use the same encoding.
As I said before, a modern x86 processor can run an 16-bit operating system. Meaning that the processor has a 16-bit mode. And when you use the `01 /r` encoding the processor can interpret that as a 16-bit instruction if it's running in 16-bit mode. The 16-bit instruction is still usable in 64-bit mode however, you need to use a specific prefix, for it.

What does the `REX.W` in `REX.W + 01 /r`  mean ?
Differently from the 16-bit mode, instructions are 32-bit by default in 64-bit mode, and we need to use the REX prefix in order to access the 64-bit mode instruction. I believe this is for backwards compatibility (you can run a 32-bit program in a 64-bit mode through special compatibility mode).

The REX prefix can be encoded with the function below.

```C
// @W Make the addressing 64bit.
// @R Extension for the ModR/M reg field.
// @X Extension of the SIB index field.
// @B Extension for the R/M field or opcode reg field.
void emit_rex(uint8_t w, uint8_t r, uint8_t x, uint8_t b) {
    uint8_t result = (0b0100 << 4) | (w << 3) | (r << 2) | (x << 1) | b;
    push_int8(result);
}
```
__NOTE:__ `push_intXX()` family of functions just emit a byte to the output stream. We assume they are already defined in the rest of the article.

As specified in the comment, we need to give `1` to the W field to make the instruction 64-bit.

## What is ModRM.
ModRM is what makes x86 a CISC (Complex Instruction Set Computer) architecture. ModRM allows a single opcode to have different addressing modes.
The `/` in the `REX.W + 01 /r` means that this instruction uses the __ModRM__ byte.

The __ModRM__ byte has 3 parts.
* __mod__ Specifies which addressing mode we are using.
* __regop__ Either register for other side or a __constant value for unary operations__ (`/1` etc).
* __rm__ Register used for the addressing mode.

Please note that for unary instructions the encoding will be like `/4` which means that the constant value 4 must be put inside the regop. An example of this is shown with the encoding of the `call r/m64` instruction.  

The code below encodes the __ModRM__ byte.
```c
 emit_modrm(uint8_t mod, uint8_t regop, uint8_t rm) {
    uint8_t result = (mod << 6) | (regop << 3) | rm;
    push_int8(result);
}
```

 Mod | Addressing mode| Meaning   
-----|----------------|----------
  0  | [rm]           | Value of the memory address pointed by the register `rm`
  1  | [rm + disp8]   | Value of the memory address pointed by the register `rm` plus an offset.
  2  | [rm + disp32]  | Same as above but a 32-bit offset instead of 8-bits.
  3  | rm             | Just value in the register. 

I said that `rm` is the register and `regop` is sometimes used as a register but which value corresponds to which register ? We can use the table bellow.

 Register  | Code | Notes 
-----------|------|-------
 RAX       | 0    | The accumulator. Some instructions require that one of the operands is in this register.
 RCX       | 1    | 
 RDX       | 2    | 
 RBX       | 3    | Frame pointer, points to the start of the current frame.
 RSP       | 4    | Stack pointer, points to the end of the current stack. Can't be used in ModRM.
 RBP       | 5    | 
 RSI       | 6    | 
 RDI       | 7    | 
 R8        | 8    | See note below.
 R9        | 9    | 
 ...       | ...  | 
 R15       | 15   | 

!!! note "__Important Note:__ For encoding registers R8-R15 you must use the REX R and B fields. The reason we have to do this is because the registers R8 to R15 were added with the 64-bit mode. And the encodings are same between 64 and 32 bit modes due to compatibility reasons."

From know on I will assume that the registers are defined in a enum.
Now let's put it all together and try to encode `ADD RCX, RDX`

```c
    emit_rex(1, 0, 0, 0);
    push_int8(0x01);  // opcode for add.
    emit_modrm(3, RDX, RCX);
```

Before we move on let's check that our code is working properly, we can save the byte stream to a file and disassemble it using the `objdump` command.

```bash
objdump -D -Mintel,x86-64 -b binary -m i386 $1 
```

Aaand the output is:

```bash
$ objdump -D -Mintel,x86-64 -b binary -m i386 assembly_output

assembly_output:     file format binary


Disassembly of section .data:

00000000 <.data>:
   0:   48 01 cd                add    rcx,rdx
```

Yaay ! Let's try to encode `ADD [RCX], RDX` this will add RDX to the value in the address pointed in RCX.

```c
    emit_rex(1, 0, 0, 0);
    push_int8(0x01);  // opcode for add.
    emit_modrm(0, RCX, RDX); // mod type changed !
```

Now let's try something a little bit more difficult, as I said before, we will be storing all values in stack. So let's try RBP (Frame pointer) relative addressing. This is the __most important one__ because we will be primarily using this addressing mode.

`ADD [RBP - offset], RCX`

```c
    emit_rex(1, 0, 0, 0);
    push_int8(0x01);  // opcode for add.
    emit_modrm(2, RCX, RBP);
    push_int32(-offset);
```

Most instructions does not accept 64-bit constant values. We can use the `MOVABS reg64, imm64` instruction to load a 64 bit value to a register and then use that register.

```c
// Store a constant value in a register.
void store_const_in_reg(reg64 reg, uint64_t cons) {
    uint8_t regNumber = (uint8_t)reg;
    emit_rex(1, 0, 0, regNumber > 7);
    regNumber &= 0b111;

    // MOVABS REG64, CONST64
    push_int8(0xB8 | regNumber); // This is different from any other instruction that we have seen so far.
    push_int64(cons);
}
```

!!! note "If you don't know which instruction to use, you can cheat a little bit and use [godbolt.com](https://godbolt.com) to compare C code to assembly."

# Putting it all together
We looked at parsing, and encoding x86 instructions now let's put everything together.

## Setting up and cleaning stack frames
When we enter a function, we must first setup the stack frame and on exit we must remove it. Since we will be keeping all values in stack we also need to allocate stack space. 

```nasm
    push RBP ; Save the old stack frame.
    mov RBP, RSP ; Create a new stack frame.
    sub RSP, 0x16 ; Stack space we want to allocate, stack must be aligned to 16 bytes or bad things will happen. (We use sub here because the stack grows downwards).

    ; Insert code here.

    mov RSP, RBP ; Restore stack pointer
    pop RBP ; Restore frame pointer.
```

One problem here is that we need to emit the code for stack frame allocation before we compile the rest of this function. We don't actually know the amount of space we need to allocate.

The solution is to hold a pointer to the point where the constant value lives in the output stream and fill it in later.

```c
int32_t* emit_prolog() {
    push_stack(RBP); // save rbp.
    mov_reg_reg(RBP, RSP);

    // sub RSP, <const_value>
    emit_rex(1, 0, 0, 0);
    push_int8(0x81);
    emit_modrm(3, 5, RSP);

    // Stack size needs to be filled in later, return a pointer.
    uint32_t *result = (uint32_t*)((void*)result_buffer + result_size);
    push_int32(0); // place holder value.
    return result;
}

compile_exp_function_dec(current) {
    ...

    uint32_t *stack_size_location = emit_prolog();

    ... (compiling the function)

    // Fill in the stack size.
    *stack_size_location = stack_size;
```

## Implementing binary operators

The `add_slots` function that was referenced in the operator table is as follows. Remember that this function will be called by `compile_expression_`. It takes in two stack offsets `a` and `b` and returns another stack offset containing the result value.

```c
slot_t add_slots(slot_t slot_a, slot_t slot_b) {
    slot_t result = copy_slot(slot_a); // copy the value a into a new stack slot.
    load_slot(slot_b, RAX); // mov RAX, [rbp + slot_b]

    // add [rbp + result], RAX
    emit_rex(1, 0, 0, 0);
    push_int8(0x01);  //opcode
    modrm_slot(result, RAX);

    return result;
}
```

I won't show all of the instructions as  I said before, if you are curious please check the source code.


## Calling functions

We can look at the instruction reference and find the encoding for the "call" instruction. We can see that there are several variations of the call instruction. I preferred to go with `CALL r/m64` since others work relative to the program counter position. And since we don't know where the kernel will allocate the executable memory, we don't actually know what the PC is going to be at a given position in the program. I could fix this by putting a temporary value and fixing it during linking, but I wanted to keep the linking very simple by using absolute positions. We can see that the variation we chose is encoded as `FF /2` meaning that the opcode is `0xFF` and `/2` means that there is a ModRM with the `regop` being 0x2.

### Finding pointers of external functions

We want to be able to call LibC functions such as puts, printf, scanf etc as well as other functions from other libraries.
To find the address of an external function, we can use the `dlsym` function. For example:

```c
    void *dlHandle = dlopen(0, RTLD_NOW);
    void (*putsFunction)(char *) = dlsym(dlHandle, "puts");
    putsFunction("Hello function");
```


### Passing arguments
We now know the address of a function, but how will we pass arguments to it ?

To know where to put argument, we need to look at the calling convention. Linux uses the System V Application Binary Interface. And for X86 we need to look at [System V Application Binary Interface AMD64 Architecture Processor Supplement](https://refspecs.linuxbase.org/elf/x86_64-abi-0.99.pdf).

__TLDR:__ For integer and pointer types we can use __RDI__, __RSI__, __RDX__, __RCX__, __R8__, __R9__ in that exact order, and the result value is used in the __RAX__ register. Since we keep everything in stack, we don't have to worry about callee and caller saved registers.

### Constructing a hello world program

Let's write a program that generates a function that calls the `puts` function and passes a hello world message as an argument.
```c
  ...
    // We don't need to setup a stack frame since we are not storing anything in the stack.
    void *putsFunction = dlsym(dlHandle, "puts");
    store_const_in_reg(RAX, (uint64_t)putsFunction);

    char *msg = "Hello world";
    // Store the call argument in RDI, as required by the application binary interface.
    store_const_in_reg(RDI, (uint64_t)msg);
    push_int8(0xFF);
    emit_modrm(3, 2 /* Intel requires us that have 2 here. */, RAX);
    
    push_int8(0xC3); // Ret instruction.

    void *executable = allocate_executable(result_size); // allocate executable memory with mmap.
    memcpy(executable, result_buffer, result_size);

    ((void (*)())executable)(); // Call the executable code !!
```

## Handling Control flow

To compile an if block, we compile the conditional expression. compare it's value to zero, and if the value is zero we jump over the code block where the contents of the if block is located. One small problem is that we don't know the length of the code block since we haven't even parsed it yet !

What we can do instead is temporary emit zero, and fill in the value later.

```c

// Return value is a pointer to the relative offset in the emitted code.
uint32_t* jump_zero_offset() {
    push_int8(0x0f); // JZ rel32
    push_int8(0x84);
    uint32_t *jump_offset_point = (uint32_t*)(result_buffer + result_size);
    push_int32(0); // will be replaced later.
    return jump_offset_point;
}
```

```c
void compile_if(char **current) {
    skip_gap(current);

    assert_compilation(**current == '(');
    (*current)++;
    // compile the condition.
    slot_t condition = compile_expression(current);
    
    assert_compilation(**current == ')');
    (*current)++;

    cmp_imm(condition, 0);
    
    // Jump to end of block if the condition is not met.
    uint32_t *jump_offset_point = jump_zero_offset();

    // Relative offsets are relative to the end of the instruction.
    uint32_t body_begin = result_size;

    // Compile the contents of the if block.
    compile_exp_st_block(current);
    // Fill in the jump offset
    *jump_offset_point = result_size - body_begin;
}
```

Handling a while loop is just the same, except that you have a jmp to the point where you evaluate the condition

## Static Linking
When handling the compilation of an if block we had to fill in the value of `jump_offset_point` later because we didn't knew it's offset yet. This is called a forwards reference. In this particular case since there is only one reference to the unknown address we just used a pointer. But there are cases where there could be arbitrary number of references to unknown positions in our program. 

To give examples:

__Forward declarations of local functions:__

```c
    // this is how we do forwards declarations btw.
    funA() {}

    funB() {
        funA(); // we don't know the actual address of funA !
        funA();
    }

    funA() {
        puts("I am the real funA.");
    }

```

__Return statments:__ 
To implement the return statement we must evaluate the returned expression, move the result to `RAX` and the jump to the end of the function (we can't just have a `ret` instruction because we need to clean the stack).
```c
    test(a) {
        if (a == 321 )
            return 35; // we don't know where the end of the function is !
        if (a == 123)
            return 30; // we don't know where the end of the function is !
        return 123;
    }
```

__Break statments:__ 
```c
    test() {
        i = 100;
        while (1) {
            if (i == 0)
                break; // we don't actually know where the end of the loop is !
            printf("i: %d\n", i);
            i = i - 1;
        }        
    }
```

Since there could be arbitrary number of references, we can't get away with a simple pointer this time. We need to keep a list of references to a particular unknown value, this is called a relocation list. At the end of compilation we go over the list of relocations and fill in the real values.

```c

// local variable or symbol.
typedef struct  {
    char name[MAX_VAR_NAME_LENGTH];
    union {
        uint32_t slot; // Slot offset of local variable.
        uint64_t value; // Sym value. only for globals syms, must be filled before linking.
    };
    bool is_function; // Function symbols need special handling.
} sym_t;

typedef struct {
    sym_t *global_sym; // symbol that we are referencing. 
    bool is_relative; // is this a rel32 or imm64.
    void *result_point; // where the value has to be written.
} reloc_t;

// Local variables.
sym_t local_syms[MAX_SYMS] = {};
size_t local_sym_count = 0;

// functions or control flow offsets.
sym_t global_syms[MAX_SYMS] = {};
size_t global_sym_count = 0;

#define MAX_RELOC_COUNT 5000
reloc_t relocations[MAX_RELOC_COUNT];
size_t reloc_count = 0;

// Called at the end of compilation.
void apply_relocs() {
    for (int i = 0; i < reloc_count; i++) {
        reloc_t *reloc = &relocations[i];
        // Apply relocation.
        if (!reloc->is_relative)
            *(uint64_t*)(reloc->result_point) = reloc->global_sym->value;
        else
            *(uint32_t*)(reloc->result_point) = reloc->global_sym->value -
                (size_t)((uint8_t*)reloc->result_point - result_buffer) - 4;
        
    }
}
```


## Variable Handling
I think implementing variables are simple. We just need to keep a map between a stack slot and variable name. And in the `compile_atom` function, if we see a variable, we just have to look it up in the variables array.

```c
    compile_exp_atom_(current) {
        ...
        if (isalpha(c)) { // identifier.
            // read the identifier into a temporary buffer.
            read_ident(current);

            // Check if a local variable first.
            sym_t *var = resolve_sym(local_syms, local_sym_count, ident_buffer); // look up the ident name in local variable array.
            if (var)
                return var->slot;

            // is this is a function pointer reference ?
            sym_t *global_sym = resolve_sym(global_syms, global_sym_count, ident_buffer);
            if (global_sym) {
                mov_reg_global(RAX, global_sym);
                slot_t result = slot_alloc();
                mov_slot_reg(result, RAX);

                return result;
            }

            // External function.
            uint64_t handle = (uint64_t)dlsym(dlHandle, ident_buffer); 
            critical_check_msg(handle != 0, "Variable not found");
        
            return mov_slot_const(handle);
        }
        ...
    }
```

# Conclusion
I think the contents in this article should be enough ammunition for you to build esoteric compilers of your own. 

In this article I mainly focused on practical stuff and I strongly suggest that you read text books on compilers if you want to learn more about the more advanced or theoretical subjects. I enjoyed reading "Engineering a Compiler 2nd Edition by Keith D. Cooper (Author), Linda Torczon".

If you think there where any errors in the article, feel free to send me an email (you can find it in the index page).

# Things you can do to extend this simple compiler

* Add more language features (add else if, for loops etc) (<span style="color: green;">easy</span>).
* Port it to other architectures (<span style="color: red;">hard</span>).
* Instead of executing it jit, write the output into an elf file (<span style="color: yellow;">medium</span>).
* Add support for other types, such as floating point numbers. You need to figure out how encode floating point instructions, and extend the compiler to support different variable types.  (<span style="color: yellow;">medium</span>).
* Instead of emitting assembly directly, figure out how to emit LLVM IR instead (<span style="color: yellow">medium</span>).
