const user_1 = document.querySelector("#quill-container-1")
const user_2 = document.querySelector("#quill-container-2")


//// Left Editor
let firstEditor = new Quill(user_1, {
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
      
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
      
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],

        ['image'],
      
        ['clean']                                         // remove formatting button
      ]
    },
    placeholder: 'user #1 Editor',
    theme: 'snow'  // or 'bubble'
});

//// Right Editor
let secondEditor = new Quill(user_2, {
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
      
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
      
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],

        ['image'],
      
        ['clean']                                         // remove formatting button
      ]
    },
    placeholder: 'user #2 Editor',
    theme: 'snow'  // or 'bubble'
});

const secondEditorDeltaStack = []
secondEditor.on("text-change", handler2)

function handler2(delta, oldDelta){
  let operations = delta.ops
  secondEditorDeltaStack.push(operations);
  console.log('User 2 (right) prints operations:', operations);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




















/*************************************************** Objects ***************************************************/

//// Character Object
function createCharacterObject()
{

  const character = {}

  character.owner = undefined;
  character.position = undefined;
  character.value = undefined;

  return character
}

//// Line Object
function createLineObject(){
  const line = {};

  line.attributes = {};

  line.content = ['\n'];

  line.getLineLength = function (){
    return line.content.length
  };

  line.insertText = function(index, text){
    line.content.splice(index, 0, ...text)
  }

  line.removeText = function(start, count){
    return this.content.splice(start, count)
  }

  line.convertToString = function(){
    return this.content.join('');
  }


  return line;
}



//// Document Object
function createDocumentObject(){
  const doc = {};
  
  
  doc.lines = []

  
  doc.init = function()
  {
    
    
    doc.insertNewLine(0);
  }
  
  
  doc.getNumberofLines = function()
  {
    
    return this.lines.length;
  }

  
  doc.getLine = function(lineNumber)
  {
    
    return this.lines[lineNumber]
  }

  
  doc.getLineLength = function(lineNumber)
  {
    
    return this.getLine(lineNumber).getLineLength()
  }

  
  doc.insertNewLine = function(index)
  {
    
    let newLineObject = createLineObject()
    this.lines.splice(index, 0, newLineObject)
  }

  
  doc.removeText = function(lineNumber, start, count)
  {
    
    return this.getLine(lineNumber).removeText(start, count);
  }

  
  doc.getLineNumber = function(index)
  {
    
    let lineLength;

    for(let lineNumber in this.lines){
      lineLength = this.getLineLength(lineNumber);

      if(index < lineLength){
        return parseInt(lineNumber);
      }

      index = index - lineLength;
    }

    return this.getNumberofLines() - 1
  }

  
  doc.getColumn = function(lineNumber, index)
  {

    let lineLength;

    for(let i = 0; i < lineNumber; i++){
      index -= this.getLineLength(i);
    }

    return index

  }

  
  doc.removeLine = function(lineNumber)
  {

    this.lines.splice(lineNumber, 1)

    if(this.getNumberofLines() === 0)
    {
      this.insertNewLine(0);
    }

  }

  
  doc.insertText = function(lineNumber, index, text)
  {

    return this.getLine(lineNumber).insertText(index, text)

  }

  
  doc.moveText = function(lineNumber, column)
  {
    
    let lineLength = this.getLineLength(lineNumber);
    let movedText;

    if(column <= lineLength)
    { // more text after column
      movedText = this.removeText(lineNumber, 0, column)
    }
    else if(column <= lineLength)
    { // more text after column  
      movedText = this.removeText(lineNumber, column, lineLength - 1 - column)
      lineNumber ++;
    }

    this.insertNewLine(lineNumber)
    this.insertText(lineNumber, 0, movedText)

  }

  
  doc.insertTextToDocument = function(index, text)
  {

    let currentLineNumber   = this.getLineNumber(index)
    let column              = this.getColumn(currentLineNumber, index)

    for(let char of text)
    {
      if (char === '\n')
      {
        if(column === (this.getLineLength(currentLineNumber) - 1))
        {
          currentLineNumber++
          this.insertNewLine(currentLineNumber)
        }
        else if(column === 0)
        {
          this.insertNewLine(currentLineNumber)
          currentLineNumber++
        }
        else
        {
          this.moveText(currentLineNumber, column)
          currentLineNumber++;
        }

        column = 0
      }
      else
      {
        this.insertText(currentLineNumber, column, char)
        column ++;
      }
    }

  }

  
  doc.deleteTextFromDocument = function(index, charsToDelete)
  {

    const firstLine   = this.getLineNumber(index)
    const lastLine    = this.getLineNumber(index + charsToDelete)

    let span          = (lastLine - firstLine) + 1;
    let currentLine   = firstLine;
    let lineLength;
    let firstColumn;
    
    if(span === 1)
    {
      lineLength  = this.getLineLength(currentLine)
      firstColumn   = this.getColumn(currentLine, index)

      if(charsToDelete === lineLength)
      {
        this.removeText(currentLine, 0, lineLength)
      }
      else
      {
        this.removeText(currentLine, firstColumn, charsToDelete)
      }
    }
    else{
      currentLine ++;

      while(span > 2)
      {
        charsToDelete -= this.getLineLength(currentLine);
        this.removeLine(currentLine)
        span--;
      }

      currentLine --;

      let topLine   = this.convertLineToString(currentLine)
      let bottomLine  = this.convertLineToString(currentLine + 1)

      let firstColumn   = this.getColumn(currentLine, index)
      let result = [...(topLine + bottomLine)]

      result.splice(firstColumn, charsToDelete)

      if(this.getNumberofLines() !== 2)
      {
        this.removeLine(currentLine)
        this.removeLine(currentLine)
        
        if(result.length === 0)
        {
          return
        }

          this.insertNewLine(currentLine)
      }
      else
      {
        this.removeLine(currentLine)
        this.removeLine(currentLine)

        if(result.length === 0)
        {
          return
        }
      }

      let lineAsString = result.reduce(function(string, char)
      {
        if(char === '\n')
        {
          return string
        }

        return string += char
      }, '')

      this.insertText(currentLine, 0, lineAsString)
    }

  }



  
  doc.printAsArray = function()
  {

    for(let result of this.lines)
    {
      console.log(result.content);
    }

  }

  
  doc.convertLineToString = function(lineNumber)
  {
    
    return this.getLine(lineNumber).content.join('');
  
  }

  
  doc.convertToString = function()
  {

    let text = ``;
    for(let lineNumber in this.lines){
      text += this.convertLineToString(lineNumber);
    }

    return text
  
  }

  
  doc.printToConsole = function()
  {

    console.log(this.convertToString());
    return;
  
  }

  
  doc.printToConsoleAsTable = function()
  {

    let lines = []
    let lineAsString;

    for(let lineNumber in this.lines)
    {
      lineAsString = this.convertLineToString(lineNumber)
      lines.push(lineAsString === '' ? "(empty)": lineAsString)
    }

    console.table(lines)
  
  }
  
  return doc;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




















/*************************************************** Running ***************************************************/
let firstDocument = createDocumentObject()
firstDocument.init()

firstEditor.on("text-change", onTextChangeHandler)

let firstEditorDeltaStack = [];

function onTextChangeHandler(delta, oldDelta){
  // console.log(delta)
  let operation = delta.ops  
  firstEditorDeltaStack.push(operation);  
  let start = 0;
  let count = 0;
  
  for(let instruction of operation)
  {    
    if(instruction.attributes)
    {      
      continue
    }
    else if(instruction.retain)
    {
      start += instruction.retain
    }
    else if(instruction.insert)
    {
      firstDocument.insertTextToDocument(start, instruction.insert)
      start += instruction.insert.length
    }
    else if(instruction.delete)
    {
      count = instruction.delete
      firstDocument.deleteTextFromDocument(start, count)
    }
  }

  if(firstEditor.getText() === firstDocument.convertToString())
  {
    console.log("match")
  }
  else
  {
    console.log("Does not Match")
    alert("STOP Mismatch detected")
  }
}

function displayDeltaStack(deltaStack, firstDelta=0, lastDelta=undefined)
{

  let deltaCounter = firstDelta;

  for(let delta of deltaStack.slice(firstDelta, lastDelta))
  {
    deltaCounter ++;
    let title = `Delta #${deltaCounter}`

    for(let operation of delta)
    {
      console.log(title, operation);
    }

    console.log("\n")
  }

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////