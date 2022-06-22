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

  line.content = [];

  line.getNumberOfObjects = function (){
    return line.content.length
  };

  line.insertTextToDocument = function(text, index){
    line.content.splice(index, 0, ...text)
  }

  line.removeText = function(start, count){
    return this.content.splice(start, count)
  }

  line.validIndex = function(index){
    return  this.content[index] !== undefined
  }


  return line;
}



//// Document Object
function createDocumentObject(){
  const doc = {};
  doc.lines = []
  doc.nextEmptySlot = 0;
  
  doc.getNumberofLines = function(){
    return this.lines.length;
  }

  doc.getLine = function(lineNumber){
    return this.lines[lineNumber]
  }

  doc.insertToLine = function(lineNumber, text, index){
    return this.lines[lineNumber].insertTextToDocument(text, index)
  }

  doc.getLineLength = function(lineNumber){
    return this.lines[lineNumber].getNumberOfObjects()
  }

  doc.insertNewLine = function(index){
    doc.lines.splice(index, 0, createLineObject())
  }

  doc.removeTextFromLine = function(lineNumber, start, count){
    return this.getLine(lineNumber).removeText(start, count);
  }

  doc.getLineNumber = function(index){
    for(let lineNumber = 0; lineNumber < this.getNumberofLines(); lineNumber++){
      // console.log(`(bug) lineNumber: ${lineNumber}, index ${index}, line legnth ${this.getLine(lineNumber).getNumberofLines()}, condition ${this.getLine(lineNumber).getNumberofLines()}`)
  
      if(index <= this.getLineLength(lineNumber)){
        return lineNumber;
      }

      index -= this.getLineLength(lineNumber) + 1; // Pluse one is needed since quill couns '\n' as a character
    }
  }

  doc.getIndexInLine = function(lineNumber, index){
    for(let i = 0; i < lineNumber; i++){
      index -= this.getLineLength(i);
    }

    return index - lineNumber
  }

  doc.removeLine = function(lineNumber){
    this.lines.splice(lineNumber, 1)
    if(this.getNumberofLines() === 0){
      this.insertNewLine(0);
    }
  }

  doc.insertTextToDocument = function(index, text){
    
    let textArray = text.split('\n');
    let newLineCount = textArray.length - 1;
    // let [lineNumber, cursor] = this.getLineNumberFromIndex(index);
    let lineNumber = this.getLineNumber(index);
    // console.log({lineNumber})
    let currentIndex = this.getIndexInLine(lineNumber, index);

    // console.log({lineNumber, currentIndex}, {lineNumber2, cursor2})
    let lineOfText = textArray.shift(); // next line of lineOfText

    // Inerting Text
    if(lineOfText){
      this.insertToLine(lineNumber, lineOfText, currentIndex);
      currentIndex += lineOfText.length
    }
    
    while(newLineCount){ // loop to add new lines
      let lineLength = this.getLineLength(lineNumber)

      if(lineLength === currentIndex){
        this.insertNewLine(lineNumber + 1);
      }
      else if(currentIndex === 0){
        this.insertNewLine(lineNumber);
      }
      else if(currentIndex <= lineLength/2){
        let removedText = this.removeTextFromLine(lineNumber, 0, currentIndex)
        this.insertNewLine(lineNumber);
        this.insertToLine(lineNumber, removedText, 0)
      }
      else if(currentIndex > lineLength/2){
        let removedObjectsCount = lineLength - currentIndex
        let removedText = this.removeTextFromLine(lineNumber, currentIndex, )
        this.insertNewLine(lineNumber + 1);
        this.insertToLine(lineNumber + 1, removedText, 0)
      }

      lineNumber ++;
      currentIndex = 0;
      lineOfText = textArray.shift();

      if(lineOfText){
        this.insertToLine(lineNumber, lineOfText, currentIndex);
        currentIndex += lineOfText.length
      }

      newLineCount --;
    }
    return

    // firstDocument.printAsArray(); // Debugging perpoces
  }

  doc.deleteTextFromDocument = function(startIndex, deleteCount){
    let debug = false;
    const startLine = this.getLineNumber(startIndex)
    const endLine = this.getLineNumber(startIndex + deleteCount)
    let span = endLine - startLine + 1;
    let currentLine = startLine;
    let lineLength;

    debug && console.log("\nNew Call", {startLine, endLine, span, currentLine, deleteCount})


    while(span > 2){   
      debug && console.log("[span > 2] is True")   
      deleteCount -= this.getLineLength(currentLine + 1) + 1;
      this.removeLine(currentLine + 1)
      span--;
    }
    debug && this.printToConsole()
    // let line = this.getLine(currentLine);
  
    let lineStart = this.getIndexInLine(currentLine, startIndex)
    lineLength = this.getLineLength(currentLine)
    // let charsToDelete = lineLength - lineStart;

    if(span === 1){
      debug && console.log("[span === 1] is True", {lineStart, lineLength, deleteCount})
      
      if(deleteCount === lineLength){
        // debug && console.log("[deleteCount === charsToDelete] is True")
        this.removeTextFromLine(currentLine, 0, lineLength)
      }else{
        this.removeTextFromLine(currentLine, lineStart, deleteCount)
      }

      span--;
    }


    if(span === 2){
    debug && console.log("[span === 2] is True", {lineStart, lineLength, deleteCount})
    
    if(deleteCount > 0){
      debug && console.log("[Count > 0] is true")
      
      lineLength = this.getLineLength(currentLine)

      debug && console.log("1.1", {lineLength, currentLine, lineStart, deleteCount})
      
      if(lineStart === 0){
        debug && console.log("[1]")
        deleteCount -= lineLength + 1;
        this.removeLine(currentLine);
      }else if(lineLength !== lineStart){
        debug && console.log("[2]")
        this.removeTextFromLine(currentLine, lineStart, deleteCount)
        deleteCount -= lineLength - lineStart + 1
        currentLine ++;
      }else{
        currentLine ++;
      }
      
      lineLength = this.getLineLength(currentLine)
      debug && console.log("1.2", {lineLength, currentLine, lineStart, deleteCount})
      debug && this.printToConsole()
      
      if(deleteCount === lineLength){
          debug && console.log("[3]")
        deleteCount -= lineLength + 1;
        this.removeTextFromLine(currentLine, 0, lineLength)

      }else if(deleteCount > 0){
          debug && console.log("[4]")
        this.removeTextFromLine(currentLine, 0, deleteCount)
        lineLength = this.getLineLength(currentLine)
        let remainingItems = this.removeTextFromLine(currentLine, 0, lineLength)
          debug && console.log("1.3", {remainingItems})
        this.removeLine(currentLine)
        currentLine --;
        lineLength = this.getLineLength(currentLine)
        this.insertToLine(currentLine, remainingItems, lineLength)
        }
      }
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
      text += '\n'
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




















/*************************************************** Running ***************************************************/
let firstDocument = createDocumentObject()
firstDocument.insertNewLine()


const firstLine = createLineObject();
firstEditor.on("text-change", onTextChangeHandler)

let firstEditorDeltaStack = [];

function onTextChangeHandler(delta, oldDelta){
  // console.log(delta)
  let operation = delta.ops
  // console.log({delta, oldDelta})
  firstEditorDeltaStack.push(operation);  
  let start = 0;
  let count = 0;

  // console.log({operation})
  for(let instruction of operation){
    // console.log({instruction})
    if(instruction.attributes){
      // console.log(`Format ${Object.values(instruction.attributes)} - start ${start}, length ${instruction.retain}`)
    }
    else if(instruction.retain){
      // console.log(`Update start to ${instruction.retain}`)
      start = instruction.retain
    }
    else if(instruction.insert){
      // console.log(`insert ${instruction.insert} at ${start}`)
      firstDocument.insertTextToDocument(start, instruction.insert)
      start += instruction.insert.length
      console.log(`\nInsert '${instruction.insert === '\n' ? "\\n" : instruction.insert}' at index ${start - 1}`)
      firstDocument.printToConsoleAsTable()
      console.log("--\n")
    }
    else if(instruction.delete){
      // console.log(`delete - start ${start}, count ${instruction.delete}`)
      count = instruction.delete
      // console.log({start, count})
      console.log(`\nDelete from index ${start === 0 ? 0 : start - 1} to ${start + instruction.delete - 1} (fron line ${firstDocument.getLineNumber(start)} to ${firstDocument.getLineNumber(start + count)})`)
      firstDocument.deleteTextFromDocument(start, count)
      firstDocument.printToConsoleAsTable()
      console.log("--\n")
    }
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