
Extracted from `v8/src/interpreter/interpreter-generator.cc`

###  LdaZero

Load literal '0' into the accumulator.
###  LdaSmi &lt;imm&gt;

Load an integer literal into the accumulator as a Smi.
###  LdaConstant &lt;idx&gt;

Load constant literal at **idx** in the constant pool into the accumulator.
###  LdaUndefined

Load Undefined into the accumulator.
###  LdaNull

Load Null into the accumulator.
###  LdaTheHole

Load TheHole into the accumulator.
###  LdaTrue

Load True into the accumulator.
###  LdaFalse

Load False into the accumulator.
###  Ldar &lt;src&gt;

Load accumulator with value from register **src**.
###  Star &lt;dst&gt;

Store accumulator to register **dst**.
###  Star0 - StarN

Store accumulator to one of a special batch of registers, without using a
second byte to specify the destination.

Even though this handler is declared as Star0, multiple entries in
the jump table point to this handler.
###  Mov &lt;src&gt; &lt;dst&gt;

Stores the value of register **src** to register **dst**.
###  LdaGlobal &lt;name\_index&gt; &lt;slot&gt;

Load the global with name in constant pool entry **name\_index** into the
accumulator using FeedBackVector slot **slot** outside of a typeof.
###  LdaGlobalInsideTypeof &lt;name\_index&gt; &lt;slot&gt;

Load the global with name in constant pool entry **name\_index** into the
accumulator using FeedBackVector slot **slot** inside of a typeof.
###  StaGlobal &lt;name\_index&gt; &lt;slot&gt;

Store the value in the accumulator into the global with name in constant pool
entry **name\_index** using FeedBackVector slot **slot**.
###  LdaContextSlot &lt;context&gt; &lt;slot\_index&gt; &lt;depth&gt;

Load the object in **slot\_index** of the context at **depth** in the context
chain starting at **context** into the accumulator.
###  LdaImmutableContextSlot &lt;context&gt; &lt;slot\_index&gt; &lt;depth&gt;

Load the object in **slot\_index** of the context at **depth** in the context
chain starting at **context** into the accumulator.
###  LdaCurrentContextSlot &lt;slot\_index&gt;

Load the object in **slot\_index** of the current context into the accumulator.
###  LdaImmutableCurrentContextSlot &lt;slot\_index&gt;

Load the object in **slot\_index** of the current context into the accumulator.
###  StaContextSlot &lt;context&gt; &lt;slot\_index&gt; &lt;depth&gt;

Stores the object in the accumulator into **slot\_index** of the context at
**depth** in the context chain starting at **context**.
###  StaCurrentContextSlot &lt;slot\_index&gt;

Stores the object in the accumulator into **slot\_index** of the current
context.
###  LdaLookupSlot &lt;name\_index&gt;

Lookup the object with the name in constant pool entry **name\_index**
dynamically.
###  LdaLookupSlotInsideTypeof &lt;name\_index&gt;

Lookup the object with the name in constant pool entry **name\_index**
dynamically without causing a NoReferenceError.
###  LdaLookupContextSlot &lt;name\_index&gt;

Lookup the object with the name in constant pool entry **name\_index**
dynamically.
###  LdaLookupContextSlotInsideTypeof &lt;name\_index&gt;

Lookup the object with the name in constant pool entry **name\_index**
dynamically without causing a NoReferenceError.
###  LdaLookupGlobalSlot &lt;name\_index&gt; &lt;feedback\_slot&gt; &lt;depth&gt;

Lookup the object with the name in constant pool entry **name\_index**
dynamically.
###  LdaLookupGlobalSlotInsideTypeof &lt;name\_index&gt; &lt;feedback\_slot&gt; &lt;depth&gt;

Lookup the object with the name in constant pool entry **name\_index**
dynamically without causing a NoReferenceError.
###  StaLookupSlot &lt;name\_index&gt; &lt;flags&gt;

Store the object in accumulator to the object with the name in constant
pool entry **name\_index**.
###  GetNamedProperty &lt;object&gt; &lt;name\_index&gt; &lt;slot&gt;

Calls the LoadIC at FeedBackVector slot **slot** for **object** and the name at
constant pool entry **name\_index**.
###  GetNamedPropertyFromSuper &lt;receiver&gt; &lt;name\_index&gt; &lt;slot&gt;

Calls the LoadSuperIC at FeedBackVector slot **slot** for **receiver**, home
object's prototype (home object in the accumulator) and the name at constant
pool entry **name\_index**.
###  GetKeyedProperty &lt;object&gt; &lt;slot&gt;

Calls the KeyedLoadIC at FeedBackVector slot **slot** for **object** and the key
in the accumulator.
###  SetNamedProperty &lt;object&gt; &lt;name\_index&gt; &lt;slot&gt;

Calls the StoreIC at FeedBackVector slot **slot** for **object** and
the name in constant pool entry **name\_index** with the value in the
accumulator.
###  DefineNamedOwnProperty &lt;object&gt; &lt;name\_index&gt; &lt;slot&gt;

Calls the DefineNamedOwnIC at FeedBackVector slot **slot** for **object** and
the name in constant pool entry **name\_index** with the value in the
accumulator.
###  SetKeyedProperty &lt;object&gt; &lt;key&gt; &lt;slot&gt;

Calls the KeyedStoreIC at FeedbackVector slot **slot** for **object** and
the key **key** with the value in the accumulator. This could trigger
the setter and the set traps if necessary.
###  DefineKeyedOwnProperty &lt;object&gt; &lt;key&gt; &lt;flags&gt; &lt;slot&gt;

Calls the DefineKeyedOwnIC at FeedbackVector slot **slot** for **object** and
the key **key** with the value in the accumulator. Whether set\_function\_name
is stored in DefineKeyedOwnPropertyFlags **flags**.

This is similar to SetKeyedProperty, but avoids checking the prototype
chain, and in the case of private names, throws if the private name already
exists.
###  StaInArrayLiteral &lt;array&gt; &lt;index&gt; &lt;slot&gt;

Calls the StoreInArrayLiteralIC at FeedbackVector slot **slot** for **array** and
the key **index** with the value in the accumulator.
###  DefineKeyedOwnPropertyInLiteral &lt;object&gt; &lt;name&gt; &lt;flags&gt; &lt;slot&gt;

Define a property **name** with value from the accumulator in **object**.
Property attributes and whether set\_function\_name are stored in
DefineKeyedOwnPropertyInLiteralFlags **flags**.

This definition is not observable and is used only for definitions
in object or class literals.
###  LdaModuleVariable &lt;cell\_index&gt; &lt;depth&gt;

Load the contents of a module variable into the accumulator.  The variable is
identified by **cell\_index**.  **depth** is the depth of the current context
relative to the module context.
###  StaModuleVariable &lt;cell\_index&gt; &lt;depth&gt;

Store accumulator to the module variable identified by **cell\_index**.
**depth** is the depth of the current context relative to the module context.
###  PushContext &lt;context&gt;

Saves the current context in **context**, and pushes the accumulator as the
new current context.
###  PopContext &lt;context&gt;

Pops the current context and sets **context** as the new context.
###  Add &lt;src&gt;

Add register **src** to accumulator.
###  Sub &lt;src&gt;

Subtract register **src** from accumulator.
###  Mul &lt;src&gt;

Multiply accumulator by register **src**.
###  Div &lt;src&gt;

Divide register **src** by accumulator.
###  Mod &lt;src&gt;

Modulo register **src** by accumulator.
###  Exp &lt;src&gt;

Exponentiate register **src** (base) with accumulator (exponent).
###  AddSmi &lt;imm&gt;

Adds an immediate value **imm** to the value in the accumulator.
###  SubSmi &lt;imm&gt;

Subtracts an immediate value **imm** from the value in the accumulator.
###  MulSmi &lt;imm&gt;

Multiplies an immediate value **imm** to the value in the accumulator.
###  DivSmi &lt;imm&gt;

Divides the value in the accumulator by immediate value **imm**.
###  ModSmi &lt;imm&gt;

Modulo accumulator by immediate value **imm**.
###  ExpSmi &lt;imm&gt;

Exponentiate accumulator (base) with immediate value **imm** (exponent).
###  BitwiseOr &lt;src&gt;

BitwiseOr register **src** to accumulator.
###  BitwiseXor &lt;src&gt;

BitwiseXor register **src** to accumulator.
###  BitwiseAnd &lt;src&gt;

BitwiseAnd register **src** to accumulator.
###  ShiftLeft &lt;src&gt;

Left shifts register **src** by the count specified in the accumulator.
Register **src** is converted to an int32 and the accumulator to uint32
before the operation. 5 lsb bits from the accumulator are used as count
i.e. **src** &lt;&lt; (accumulator &amp; 0x1F).
###  ShiftRight &lt;src&gt;

Right shifts register **src** by the count specified in the accumulator.
Result is sign extended. Register **src** is converted to an int32 and the
accumulator to uint32 before the operation. 5 lsb bits from the accumulator
are used as count i.e. **src** &gt;&gt; (accumulator &amp; 0x1F).
###  ShiftRightLogical &lt;src&gt;

Right Shifts register **src** by the count specified in the accumulator.
Result is zero-filled. The accumulator and register **src** are converted to
uint32 before the operation 5 lsb bits from the accumulator are used as
count i.e. **src** &lt;&lt; (accumulator &amp; 0x1F).
###  BitwiseOrSmi &lt;imm&gt;

BitwiseOrSmi accumulator with **imm**.
###  BitwiseXorSmi &lt;imm&gt;

BitwiseXorSmi accumulator with **imm**.
###  BitwiseAndSmi &lt;imm&gt;

BitwiseAndSmi accumulator with **imm**.
###  BitwiseNot &lt;feedback\_slot&gt;

Perform bitwise-not on the accumulator.
###  ShiftLeftSmi &lt;imm&gt;

Left shifts accumulator by the count specified in **imm**.
The accumulator is converted to an int32 before the operation. The 5
lsb bits from **imm** are used as count i.e. **src** **&lt; (&lt;imm** &amp; 0x1F).
###  ShiftRightSmi &lt;imm&gt;

Right shifts accumulator by the count specified in **imm**. Result is sign
extended. The accumulator is converted to an int32 before the operation. The
5 lsb bits from **imm** are used as count i.e. **src** &gt;&gt; (**imm** &amp; 0x1F).
###  ShiftRightLogicalSmi &lt;imm&gt;

Right shifts accumulator by the count specified in **imm**. Result is zero
extended. The accumulator is converted to an int32 before the operation. The
5 lsb bits from **imm** are used as count i.e. **src** &gt;&gt;&gt; (**imm** &amp; 0x1F).
###  Negate &lt;feedback\_slot&gt;

Perform arithmetic negation on the accumulator.
###  ToName &lt;dst&gt;

Convert the object referenced by the accumulator to a name.
###  ToNumber &lt;slot&gt;

Convert the object referenced by the accumulator to a number.
###  ToNumeric &lt;slot&gt;

Convert the object referenced by the accumulator to a numeric.
###  ToObject &lt;dst&gt;

Convert the object referenced by the accumulator to a JSReceiver.
###  ToString

Convert the accumulator to a String.
###  ToString

Convert the accumulator to a String.
###  Inc

Increments value in the accumulator by one.
###  Dec

Decrements value in the accumulator by one.
###  ToBooleanLogicalNot

Perform logical-not on the accumulator, first casting the
accumulator to a boolean value if required.
###  LogicalNot

Perform logical-not on the accumulator, which must already be a boolean
value.
###  TypeOf

Load the accumulator with the string representating type of the
object in the accumulator.
###  DeletePropertyStrict

Delete the property specified in the accumulator from the object
referenced by the register operand following strict mode semantics.
###  DeletePropertySloppy

Delete the property specified in the accumulator from the object
referenced by the register operand following sloppy mode semantics.
###  GetSuperConstructor

Get the super constructor from the object referenced by the accumulator.
The result is stored in register **reg**.
###  Call &lt;callable&gt; &lt;receiver&gt; &lt;arg\_count&gt; &lt;feedback\_slot\_id&gt;

Call a JSfunction or Callable in **callable** with the **receiver** and
**arg\_count** arguments in subsequent registers. Collect type feedback
into **feedback\_slot\_id**
### CallProperty
### CallProperty0
### CallProperty1
### CallProperty2
### CallUndefinedReceiver
### CallUndefinedReceiver0
### CallUndefinedReceiver1
### CallUndefinedReceiver2
###  CallRuntime &lt;function\_id&gt; &lt;first\_arg&gt; &lt;arg\_count&gt;

Call the runtime function **function\_id** with the first argument in
register **first\_arg** and **arg\_count** arguments in subsequent
registers.
###  InvokeIntrinsic &lt;function\_id&gt; &lt;first\_arg&gt; &lt;arg\_count&gt;

Implements the semantic equivalent of calling the runtime function
**function\_id** with the first argument in **first\_arg** and **arg\_count**
arguments in subsequent registers.
###  CallRuntimeForPair &lt;function\_id&gt; &lt;first\_arg&gt; &lt;arg\_count&gt; &lt;first\_return&gt;

Call the runtime function **function\_id** which returns a pair, with the
first argument in register **first\_arg** and **arg\_count** arguments in
subsequent registers. Returns the result in **first\_return** and
**first\_return + 1**
###  CallJSRuntime &lt;context\_index&gt; &lt;receiver&gt; &lt;arg\_count&gt;

Call the JS runtime function that has the **context\_index** with the receiver
in register **receiver** and **arg\_count** arguments in subsequent registers.
###  CallWithSpread &lt;callable&gt; &lt;first\_arg&gt; &lt;arg\_count&gt;

Call a JSfunction or Callable in **callable** with the receiver in
**first\_arg** and **arg\_count - 1** arguments in subsequent registers. The
final argument is always a spread.

###  ConstructWithSpread &lt;first\_arg&gt; &lt;arg\_count&gt;

Call the constructor in **constructor** with the first argument in register
**first\_arg** and **arg\_count** arguments in subsequent registers. The final
argument is always a spread. The new.target is in the accumulator.

###  Construct &lt;constructor&gt; &lt;first\_arg&gt; &lt;arg\_count&gt;

Call operator construct with **constructor** and the first argument in
register **first\_arg** and **arg\_count** arguments in subsequent
registers. The new.target is in the accumulator.

###  TestEqual &lt;src&gt;

Test if the value in the **src** register equals the accumulator.
###  TestEqualStrict &lt;src&gt;

Test if the value in the **src** register is strictly equal to the accumulator.
###  TestLessThan &lt;src&gt;

Test if the value in the **src** register is less than the accumulator.
###  TestGreaterThan &lt;src&gt;

Test if the value in the **src** register is greater than the accumulator.
###  TestLessThanOrEqual &lt;src&gt;

Test if the value in the **src** register is less than or equal to the
accumulator.
###  TestGreaterThanOrEqual &lt;src&gt;

Test if the value in the **src** register is greater than or equal to the
accumulator.
###  TestReferenceEqual &lt;src&gt;

Test if the value in the **src** register is equal to the accumulator
by means of simple comparison. For SMIs and simple reference comparisons.
###  TestIn &lt;src&gt; &lt;feedback\_slot&gt;

Test if the object referenced by the register operand is a property of the
object referenced by the accumulator.
###  TestInstanceOf &lt;src&gt; &lt;feedback\_slot&gt;

Test if the object referenced by the **src** register is an an instance of type
referenced by the accumulator.
###  TestUndetectable

Test if the value in the accumulator is undetectable (null, undefined or
document.all).
###  TestNull

Test if the value in accumulator is strictly equal to null.
###  TestUndefined

Test if the value in the accumulator is strictly equal to undefined.
###  TestTypeOf &lt;literal\_flag&gt;

Tests if the object in the **accumulator** is typeof the literal represented
by **literal\_flag**.
###  Jump &lt;imm&gt;

Jump by the number of bytes represented by the immediate operand **imm**.
###  JumpConstant &lt;idx&gt;

Jump by the number of bytes in the Smi in the **idx** entry in the constant
pool.
###  JumpIfTrue &lt;imm&gt;

Jump by the number of bytes represented by an immediate operand if the
accumulator contains true. This only works for boolean inputs, and
will misbehave if passed arbitrary input values.
###  JumpIfTrueConstant &lt;idx&gt;

Jump by the number of bytes in the Smi in the **idx** entry in the constant
pool if the accumulator contains true. This only works for boolean inputs,
and will misbehave if passed arbitrary input values.
###  JumpIfFalse &lt;imm&gt;

Jump by the number of bytes represented by an immediate operand if the
accumulator contains false. This only works for boolean inputs, and
will misbehave if passed arbitrary input values.
###  JumpIfFalseConstant &lt;idx&gt;

Jump by the number of bytes in the Smi in the **idx** entry in the constant
pool if the accumulator contains false. This only works for boolean inputs,
and will misbehave if passed arbitrary input values.
###  JumpIfToBooleanTrue &lt;imm&gt;

Jump by the number of bytes represented by an immediate operand if the object
referenced by the accumulator is true when the object is cast to boolean.
###  JumpIfToBooleanTrueConstant &lt;idx&gt;

Jump by the number of bytes in the Smi in the **idx** entry in the constant
pool if the object referenced by the accumulator is true when the object is
cast to boolean.
###  JumpIfToBooleanFalse &lt;imm&gt;

Jump by the number of bytes represented by an immediate operand if the object
referenced by the accumulator is false when the object is cast to boolean.
###  JumpIfToBooleanFalseConstant &lt;idx&gt;

Jump by the number of bytes in the Smi in the **idx** entry in the constant
pool if the object referenced by the accumulator is false when the object is
cast to boolean.
###  JumpIfNull &lt;imm&gt;

Jump by the number of bytes represented by an immediate operand if the object
referenced by the accumulator is the null constant.
###  JumpIfNullConstant &lt;idx&gt;

Jump by the number of bytes in the Smi in the **idx** entry in the constant
pool if the object referenced by the accumulator is the null constant.
###  JumpIfNotNull &lt;imm&gt;

Jump by the number of bytes represented by an immediate operand if the object
referenced by the accumulator is not the null constant.
###  JumpIfNotNullConstant &lt;idx&gt;

Jump by the number of bytes in the Smi in the **idx** entry in the constant
pool if the object referenced by the accumulator is not the null constant.
###  JumpIfUndefined &lt;imm&gt;

Jump by the number of bytes represented by an immediate operand if the object
referenced by the accumulator is the undefined constant.
###  JumpIfUndefinedConstant &lt;idx&gt;

Jump by the number of bytes in the Smi in the **idx** entry in the constant
pool if the object referenced by the accumulator is the undefined constant.
###  JumpIfNotUndefined &lt;imm&gt;

Jump by the number of bytes represented by an immediate operand if the object
referenced by the accumulator is not the undefined constant.
###  JumpIfNotUndefinedConstant &lt;idx&gt;

Jump by the number of bytes in the Smi in the **idx** entry in the constant
pool if the object referenced by the accumulator is not the undefined
constant.
###  JumpIfUndefinedOrNull &lt;imm&gt;

Jump by the number of bytes represented by an immediate operand if the object
referenced by the accumulator is the undefined constant or the null constant.
###  JumpIfUndefinedOrNullConstant &lt;idx&gt;

Jump by the number of bytes in the Smi in the **idx** entry in the constant
pool if the object referenced by the accumulator is the undefined constant or
the null constant.
###  JumpIfJSReceiver &lt;imm&gt;

Jump by the number of bytes represented by an immediate operand if the object
referenced by the accumulator is a JSReceiver.
###  JumpIfJSReceiverConstant &lt;idx&gt;

Jump by the number of bytes in the Smi in the **idx** entry in the constant
pool if the object referenced by the accumulator is a JSReceiver.
###  JumpLoop &lt;imm&gt; &lt;loop\_depth&gt;

Jump by the number of bytes represented by the immediate operand **imm**. Also
performs a loop nesting check, a stack check, and potentially triggers OSR.
###  SwitchOnSmiNoFeedback &lt;table\_start&gt; &lt;table\_length&gt; &lt;case\_value\_base&gt;

Jump by the number of bytes defined by a Smi in a table in the constant pool,
where the table starts at **table\_start** and has **table\_length** entries.
The table is indexed by the accumulator, minus **case\_value\_base**. If the
case\_value falls outside of the table **table\_length**, fall-through to the
next bytecode.
###  CreateRegExpLiteral &lt;pattern\_idx&gt; &lt;literal\_idx&gt; &lt;flags&gt;

Creates a regular expression literal for literal index **literal\_idx** with
**flags** and the pattern in **pattern\_idx**.
###  CreateArrayLiteral &lt;element\_idx&gt; &lt;literal\_idx&gt; &lt;flags&gt;

Creates an array literal for literal index **literal\_idx** with
CreateArrayLiteral flags **flags** and constant elements in **element\_idx**.
###  CreateEmptyArrayLiteral &lt;literal\_idx&gt;

Creates an empty JSArray literal for literal index **literal\_idx**.
###  CreateArrayFromIterable

Spread the given iterable from the accumulator into a new JSArray.
TODO(neis): Turn this into an intrinsic when we're running out of bytecodes.
###  CreateObjectLiteral &lt;element\_idx&gt; &lt;literal\_idx&gt; &lt;flags&gt;

Creates an object literal for literal index **literal\_idx** with
CreateObjectLiteralFlags **flags** and constant elements in **element\_idx**.
###  CreateEmptyObjectLiteral

Creates an empty JSObject literal.
###  CloneObject &lt;source\_idx&gt; &lt;flags&gt; &lt;feedback\_slot&gt;

Allocates a new JSObject with each enumerable own property copied from
{source}, converting getters into data properties.
###  GetTemplateObject &lt;descriptor\_idx&gt; &lt;literal\_idx&gt;

Creates the template to pass for tagged templates and returns it in the
accumulator, creating and caching the site object on-demand as per the
specification.
###  CreateClosure &lt;index&gt; &lt;slot&gt; &lt;flags&gt;

Creates a new closure for SharedFunctionInfo at position **index** in the
constant pool and with pretenuring controlled by **flags**.
###  CreateBlockContext &lt;index&gt;

Creates a new block context with the scope info constant at **index**.
###  CreateCatchContext &lt;exception&gt; &lt;scope\_info\_idx&gt;

Creates a new context for a catch block with the **exception** in a register
and the ScopeInfo at **scope\_info\_idx**.
###  CreateFunctionContext &lt;scope\_info\_idx&gt; &lt;slots&gt;

Creates a new context with number of **slots** for the function closure.
###  CreateEvalContext &lt;scope\_info\_idx&gt; &lt;slots&gt;

Creates a new context with number of **slots** for an eval closure.
###  CreateWithContext &lt;register&gt; &lt;scope\_info\_idx&gt;

Creates a new context with the ScopeInfo at **scope\_info\_idx** for a
with-statement with the object in **register**.
###  CreateMappedArguments

Creates a new mapped arguments object.
###  CreateUnmappedArguments

Creates a new unmapped arguments object.
###  CreateRestParameter

Creates a new rest parameter array.
###  SetPendingMessage

Sets the pending message to the value in the accumulator, and returns the
previous pending message in the accumulator.
###  Throw

Throws the exception in the accumulator.
###  ReThrow

Re-throws the exception in the accumulator.
###  Abort &lt;abort\_reason&gt;

Aborts execution (via a call to the runtime function).
###  Return

Return the value in the accumulator.
###  ThrowReferenceErrorIfHole &lt;variable\_name&gt;

Throws an exception if the value in the accumulator is TheHole.
###  ThrowSuperNotCalledIfHole

Throws an exception if the value in the accumulator is TheHole.
###  ThrowSuperAlreadyCalledIfNotHole

Throws SuperAlreadyCalled exception if the value in the accumulator is not
TheHole.
###  ThrowIfNotSuperConstructor &lt;constructor&gt;

Throws an exception if the value in **constructor** is not in fact a
constructor.
###  FindNonDefaultConstructorOrConstruct &lt;this\_function&gt; &lt;new\_target&gt; &lt;output&gt;

Walks the prototype chain from **this\_function**'s super ctor until we see a
non-default ctor. If the walk ends at a default base ctor, creates an
instance and stores it in **output[1]** and stores true into output[0].
Otherwise, stores the first non-default ctor into **output[1]** and false into
**output[0]**.
###  Debugger

Call runtime to handle debugger statement.
###  IncBlockCounter &lt;slot&gt;

Increment the execution count for the given slot. Used for block code
coverage.
###  ForInEnumerate &lt;receiver&gt;

Enumerates the enumerable keys of the **receiver** and either returns the
map of the **receiver** if it has a usable enum cache or a fixed array
with the keys to enumerate in the accumulator.
###  ForInPrepare &lt;cache\_info\_triple&gt;

Returns state for for..in loop execution based on the enumerator in
the accumulator register, which is the result of calling ForInEnumerate
on a JSReceiver object.
The result is output in registers **cache\_info\_triple** to
**cache\_info\_triple + 2**, with the registers holding cache\_type, cache\_array,
and cache\_length respectively.
###  ForInNext &lt;receiver&gt; &lt;index&gt; &lt;cache\_info\_pair&gt;

Returns the next enumerable property in the the accumulator.
###  ForInContinue &lt;index&gt; &lt;cache\_length&gt;

Returns false if the end of the enumerable properties has been reached.
###  ForInStep &lt;index&gt;

Increments the loop counter in register **index** and stores the result
in the accumulator.
###  GetIterator &lt;object&gt;

Retrieves the object[Symbol.iterator] method, calls it and stores
the result in the accumulator. If the result is not JSReceiver,
throw SymbolIteratorInvalid runtime exception.
###  Wide

Prefix bytecode indicating next bytecode has wide (16-bit) operands.
###  ExtraWide

Prefix bytecode indicating next bytecode has extra-wide (32-bit) operands.
###  Illegal

An invalid bytecode aborting execution if dispatched.
###  SuspendGenerator &lt;generator&gt; &lt;first input register&gt; &lt;register count&gt; &lt;suspend\_id&gt;

Stores the parameters and the register file in the generator. Also stores
the current context, **suspend\_id**, and the current bytecode offset
(for debugging purposes) into the generator. Then, returns the value
in the accumulator.
###  SwitchOnGeneratorState &lt;generator&gt; &lt;table\_start&gt; &lt;table\_length&gt;

If **generator** is undefined, falls through. Otherwise, loads the
generator's state (overwriting it with kGeneratorExecuting), sets the context
to the generator's resume context, and performs state dispatch on the
generator's state by looking up the generator state in a jump table in the
constant pool, starting at **table\_start**, and of length **table\_length**.
###  ResumeGenerator &lt;generator&gt; &lt;first output register&gt; &lt;register count&gt;

Imports the register file stored in the generator and marks the generator
state as executing.