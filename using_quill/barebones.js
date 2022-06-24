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

//// Line Object
function createLineObject(){
  const line = {};

  line.attributes = {};

  line.content = ['\n'];

  line.getNumberOfObjects = function (){
    return line.content.length
  };

  line.insertToLine = function(index, text){
    line.content.splice(index, 0, ...text)
  }

  line.removeText = function(start, count){
    return this.content.splice(start, count)
  }

  line.lastCharacter = function(index){
    return  this.content.slice(-1)
  }


  return line;
}



//// Document Object
function createDocumentObject(){
  const doc = {};
  doc.lines = []
  doc.nextEmptySlot = 0;

  doc.init = function(){
    doc.insertNewLine(0);
    // doc.insertChar(0, 0, '\n')
  }
  
  doc.getNumberofLines = function(){
    return this.lines.length;
  }

  doc.getLine = function(lineNumber){
    return this.lines[lineNumber]
  }

  doc.insertChar = function(lineNumber, index, char){
    return this.lines[lineNumber].insertToLine(index, char)
  }

  doc.getLineLength = function(lineNumber){
    return this.lines[lineNumber].getNumberOfObjects()
  }

  doc.insertNewLine = function(index){
    let newLineObject = createLineObject()
    this.lines.splice(index, 0, newLineObject)
  }

  doc.removeText = function(lineNumber, start, count){
    return this.getLine(lineNumber).removeText(start, count);
  }

  doc.getLineNumber = function(index){
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

  doc.getIndexInLine = function(lineNumber, index){
    let lineLength;

    for(let i = 0; i < lineNumber; i++){
      index -= this.getLineLength(i);
    }

    return index
  }

  doc.removeLine = function(lineNumber){
    this.lines.splice(lineNumber, 1)
    if(this.getNumberofLines() === 0){
      this.insertNewLine(0);
    }
  }

  doc.isLineEnd = function(lineNumber){
    let returnVal = this.getLine(lineNumber).lastCharacter()[0]
    console.log("[isLineEnd]", {returnVal})
    return this.getLine(lineNumber).lastCharacter()[0] === '\n'
  }

  doc.insertText = function(lineNumber, index, text){
    return this.lines[lineNumber].insertToLine(index, text)
  }

  doc.moveText = function(lineNumber, index){
    
    let lineLength = this.getLineLength(lineNumber);
    let movedText;
    let newLineIndex = lineNumber;
    
    console.log("\t[moveText][0]", {lineNumber, index, lineLength})

    if(index <= lineLength)
    { // more text after index
    console.log("\t[moveText][1]")
      movedText = this.removeText(lineNumber, 0, index)
    }
    else if(index <= lineLength)
    { // more text after index
    console.log("\t[moveText][2]", lineLength - 1 - index)
      movedText = this.removeText(lineNumber, index, lineLength - 1 - index)
      newLineIndex ++;
    }

    this.insertNewLine(newLineIndex)
    this.insertText(newLineIndex, 0, movedText)    
  }

  doc.insertTextToDocument = function(index, text){
    // console.log("\n\n[0]", {index, text})
    let currentLineNumber = this.getLineNumber(index)
    let currentIndex = this.getIndexInLine(currentLineNumber, index)
    let currentLineAsString = this.getLineAsString(currentLineNumber)

    for(let char of text){
      // console.log("[1]", {currentLineNumber, currentIndex, char})

      if (char === '\n'){

        if(currentIndex === (this.getLineLength(currentLineNumber) - 1))
        {
          // console.log("[2]", {currentLineNumber, currentIndex, char})
          currentLineNumber++
          this.insertNewLine(currentLineNumber)
        }
        else if(currentIndex === 0)
        {
          // console.log("[3]", {currentLineNumber, currentIndex, char})
          this.insertNewLine(currentLineNumber)
          currentLineNumber++
        }
        else
        {
          // console.log("[4]", {currentLineNumber, currentIndex, char})
          this.moveText(currentLineNumber, currentIndex)
          currentLineNumber++;
        }

        currentIndex = 0
      }
      else
      {
        this.insertChar(currentLineNumber, currentIndex, char)
        currentIndex ++;
      }

      // this.printToConsole()
    }
  }

  doc.deleteTextFromDocument = function(startIndex, deleteCount){
    const startLine = this.getLineNumber(startIndex)
    const endLine = this.getLineNumber(startIndex + deleteCount)
    let span = endLine - startLine + 1;
    let currentLine = startLine;
    let lineLength;

    while(span > 2){   
      deleteCount -= this.getLineLength(currentLine + 1);
      this.removeLine(currentLine + 1)
      span--;
    }

    let lineStart = this.getIndexInLine(currentLine, startIndex)
    lineLength = this.getLineLength(currentLine)

    if(span === 1){
      if(deleteCount === lineLength){
        this.removeText(currentLine, 0, lineLength)
      }else{
        this.removeText(currentLine, lineStart, deleteCount)
      }
    }
    else{
      let firstLine = this.getLineAsString(currentLine)
      let secondLine = this.getLineAsString(currentLine + 1)
      let startOfDeleteion = startIndex

      let lineStart = this.getIndexInLine(currentLine, startIndex)
      let line = [...(firstLine + secondLine)]

      line.splice(lineStart, deleteCount)

      
      if(this.getNumberofLines() !== 2){
      this.removeLine(currentLine)
      this.removeLine(currentLine)


      if(line.length === 0){
        return
      }

        this.insertNewLine(currentLine)  
      }else{
        this.removeLine(currentLine)
        this.removeLine(currentLine)
  
  
        if(line.length === 0){
          return
        }  
      }



      let lineAsString = line.reduce(function(string, char){
        if(char === '\n'){
          return string
        }
        return string += char}, '')
      this.insertText(currentLine, 0, lineAsString)
    }
  }



  doc.printAsArray = function() {
    console.log('\n----------')
    for(let line of this.lines){
      console.log(line.content);
    }
    console.log('----------\n')
  }

  doc.getLineAsString = function(lineNumber){
    if(lineNumber < this.getNumberofLines()){
      return this.lines[lineNumber].content.join('');
    }
    else{
      throw "Line number does not exist"
    }
  }

  doc.convertToString = function(){
    let text = ``;
    for(let lineNumber in this.lines){
      text += this.getLineAsString(lineNumber);
    }

    return text
  }

  doc.printToConsole = function(){
    console.log(this.convertToString());
    return;
  }

  doc.printToConsoleAsTable = function(){
    let arr = []
    for(let lineNumber in this.lines){
      let str = this.getLineAsString(lineNumber)
    arr.push(str === '' ? "(empty)": str)
    }
    console.table(arr)
  }
  
  return doc;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function createCharacterObject(){
  const character = {}
  character.owner = undefined;
  character.position = undefined;
  character.value = undefined;
}



















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
  
  for(let instruction of operation){    
    if(instruction.attributes){      
    }
    else if(instruction.retain){
      start += instruction.retain
    }
    else if(instruction.insert){
      firstDocument.insertTextToDocument(start, instruction.insert)
      start += instruction.insert.length
    }
    else if(instruction.delete){
      count = instruction.delete
      firstDocument.deleteTextFromDocument(start, count)
    }
  }
  if(firstEditor.getText() === firstDocument.convertToString()){
    console.log("match")
  }else{
    console.log("Does not Match")
    alert("STOP Mismatch detected")
  }
}

function displayDeltaStack(deltaStack, startDelta=0, endDelta=undefined){
  let deltaCounter = startDelta;
  for(let delta of deltaStack.slice(startDelta, endDelta)){
    deltaCounter ++;
    let deltaName = `Delta #${deltaCounter}`
    for(let operation of delta){
      console.log(deltaName, operation);
    }
    console.log("\n")
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////