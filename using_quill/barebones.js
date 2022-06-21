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

  line.getLength = function (){
    return line.content.length
  };

  line.insertText = function(text, index = this.getLength()){
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
  
  doc.getLength = function(){
    return this.lines.length;
  }

  doc.getLine = function(lineNumber){
    return this.lines[lineNumber]
  }

  doc.insertTextToLine = function(lineNumber, text, index){
    return this.lines[lineNumber].insertText(text, index)
  }

  doc.getLineLength = function(lineNumber){
    return this.lines[lineNumber].getLength()
  }

  doc.insertNewLine = function(index){
    doc.lines.splice(index, 0, createLineObject())
  }

  doc.removeTextFromLine = function(lineNumber, start, count){
    return this.getLine(lineNumber).removeText(start, count);
  }

  doc.getLineNumber = function(start){
    for(let lineNumber = 0; lineNumber < this.getLength(); lineNumber++){
      // console.log(`(bug) lineNumber: ${lineNumber}, start ${start}, line legnth ${this.getLine(lineNumber).getLength()}, condition ${this.getLine(lineNumber).getLength()}`)
  
      if(start <= this.getLine(lineNumber).getLength()){
        return lineNumber;
      }

      start -= this.getLineLength(lineNumber) + 1; // Pluse one is needed since quill couns '\n' as a character
    }
  }

  doc.getLineStart = function(lineNumber, start){
    for(let line of this.lines.slice(0, lineNumber)){
      start -= line.getLength()
    }
    return start - lineNumber
  }

  doc.getLineNumberFromIndex = function(index){
    for(let lineNumber = 0; lineNumber < this.getLength(); lineNumber++){
      if(index <= this.lines[lineNumber].getLength()){
        return [lineNumber, index];
      }

      index -= this.lines[lineNumber].getLength() + 1;
    }
  }

  doc.deleteLine = function(lineNumber){
    this.lines.splice(lineNumber, 1)
    if(this.getLength() === 0){
      this.insertNewLine(0);
    }
  }

  doc.insertText = function(start, text){
    
    let textArray = text.split('\n');
    let newLineCount = textArray.length - 1;
    // let [lineNumber, cursor] = this.getLineNumberFromIndex(start);
    let lineNumber = this.getLineNumber(start);
    // console.log({lineNumber})
    let cursor = this.getLineStart(lineNumber, start);

    // console.log({lineNumber, cursor}, {lineNumber2, cursor2})
    text = textArray.shift(); // next line of text

    // Inerting Text
    if(text){
      this.insertTextToLine(lineNumber, text, cursor);
      cursor += text.length
    }
    
    while(newLineCount){ // loop to add new lines
      let lineLength = this.getLineLength(lineNumber)

      if(lineLength === cursor){
        this.insertNewLine(lineNumber + 1);
      }
      else if(cursor === 0){
        this.insertNewLine(lineNumber);
      }
      else if(cursor <= lineLength/2){
        let removedText = this.removeTextFromLine(lineNumber, 0, cursor)
        this.insertNewLine(lineNumber);
        this.insertTextToLine(lineNumber, removedText, 0)
      }
      else if(cursor > lineLength/2){
        let removedText = this.removeTextFromLine(lineNumber, cursor, lineLength - cursor)
        this.insertNewLine(lineNumber + 1);
        this.insertTextToLine(lineNumber + 1, removedText, 0)
      }

      lineNumber ++;
      cursor = 0;
      text = textArray.shift();

      if(text){
        this.insertTextToLine(lineNumber, text, cursor);
        cursor += text.length
      }

      newLineCount --;
    }
    return

    // firstDocument.printLines(); // Debugging perpoces
  }

  doc.deleteText = function(start, count){
    let debug = true;
    const startLine = this.getLineNumber(start)
    const endLine = this.getLineNumber(start + count)
    let span = endLine - startLine + 1;
    let currentLine = startLine;
    let lineLength;

    debug && console.log("\nNew Call", {startLine, endLine, span, currentLine, count})


    while(span > 2){   
      debug && console.log("[span > 2] is True")   
      count -= this.getLineLength(currentLine + 1) + 1;
      this.deleteLine(currentLine + 1)
      span--;
    }
    debug && this.logContents()
    // let line = this.getLine(currentLine);
  
    let lineStart = this.getLineStart(currentLine, start)
    lineLength = this.getLineLength(currentLine)
    // let charsToDelete = lineLength - lineStart;

    if(span === 1){
      debug && console.log("[span === 1] is True", {lineStart, lineLength, count})
      
      if(count === lineLength){
        // debug && console.log("[count === charsToDelete] is True")
        this.removeTextFromLine(currentLine, 0, lineLength)
      }else{
        this.removeTextFromLine(currentLine, lineStart, count)
      }

      span--;
    }


    if(span === 2){
    debug && console.log("[span === 2] is True", {lineStart, lineLength, count})

    // if(lineLength === 0){ // two lines separated by 4 empty lines, then delete the 4 empty lines
    //   debug && console.log("[lineLength === 0)] is True")
    //   count --;
    //   this.deleteLine(currentLine) 
    // }

    // if(lineStart === lineLength){ // when deleting a whole line 
    //   debug && console.log("[lineLength === lineStart] is True")
    //   count -= lineLength + 1;
    //   this.deleteLine(currentLine + 1)
    // }else{
    //   this.removeTextFromLine(currentLine, lineStart, count)
    //   count -= lineLength - lineStart + 1
    //   currentLine ++;
    // }
    
    // while(count > 0){
    //   debug && console.log({count})
    //   if(count >= lineLength){
    //     count -= lineLength + 1;
    //     this.deleteLine(currentLine);
    //   }
    //   try{
    //     lineLength = this.getLineLength(currentLine)
    //   }catch{
    //     currentLine--;
    //   }
    // }
    
    if(count > 0){
      debug && console.log("[Count > 0] is true")
      
      lineLength = this.getLineLength(currentLine)

      debug && console.log("1.1", {lineLength, currentLine, lineStart, count})
      
      if(lineStart === 0){
        debug && console.log("[1]")
        count -= lineLength + 1;
        this.deleteLine(currentLine);
      }else{
        debug && console.log("[2]")
        this.removeTextFromLine(currentLine, lineStart, count)
        count -= lineLength - lineStart
        currentLine ++;
      }
      
      lineLength = this.getLineLength(currentLine)
      debug && console.log("1.2", {lineLength, currentLine, lineStart, count})
      debug && this.logContents()
      
      if(count === lineLength){
        debug && console.log("[3]")
        count -= lineLength + 1;
        this.removeTextFromLine(currentLine, 0, lineLength)
      }else if(count > 0){
        debug && console.log("[4]")
        this.removeTextFromLine(currentLine, 0, count)
        lineLength = this.getLineLength(currentLine)
        let remainingItems = this.removeTextFromLine(currentLine, 0, lineLength)
        debug && console.log("1.3", {remainingItems})
        this.deleteLine(currentLine)
        currentLine --;
        lineLength = this.getLineLength(currentLine)
          this.insertTextToLine(currentLine, remainingItems, lineLength)
        }
      }
    }
  }



  doc.printLines = function() {
    console.log('\n----------')
    for(let line of this.lines){
      console.log(line.content);
    }
    console.log('----------\n')
  }

  doc.lineAsString = function(lineNumber){
    if(lineNumber < this.getLength()){
      return this.lines[lineNumber].content.join('');
    }
    else{
      throw "Line number does not exist"
    }
  }

  doc.asString = function(start = 0, end = this.getLength()){
    let text = ``;
    for(let lineNumber = start; lineNumber < end; lineNumber++){
      text += this.lineAsString(lineNumber);
      text += '\n'
    }

    return text
  }

  doc.logContents = function(){
    console.log(this.asString());
    return;
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
      firstDocument.insertText(start, instruction.insert)
      start += instruction.insert.length
    }
    else if(instruction.delete){
      // console.log(`delete - start ${start}, count ${instruction.delete}`)
      count = instruction.delete
      // console.log({start, count})
      firstDocument.deleteText(start, count)
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