const user_1 = document.querySelector("#quill-container-1")
const user_2 = document.querySelector("#quill-container-2")

let editor_1 = new Quill(user_1, {
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

let editor_2 = new Quill(user_2, {
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



function newLine(){
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


  return line;
}




function newDocument(){
  const doc = {};
  doc.lines = []
  doc.nextEmptySlot = 0;
  
  doc.getLength = function(){
    return this.lines.length;
  }

  doc.getLine = function(lineNumber = this.getLength()){
    return this.lines[lineNumber]
  }

  doc.insertTextToLine = function(lineNumber = this.getLength(), text, index){
    return this.lines[lineNumber].insertText(text, index)
  }

  doc.getLineLength = function(lineNumber = this.getLength()){
    return this.lines[lineNumber].getLength()
  }

  doc.insertNewLine = function(index = this.getLength()){
    doc.lines.splice(index, 0, newLine())
  }

  doc.removeTextFromLine = function(lineNumber, start, count){
    return this.getLine(lineNumber).removeText(start, count);
  }


  doc.insertText2 = function(index, text){
    let textArray = text.split('\n');
    let newLineCount = textArray.length - 1;
    let [lineNumber, cursor] = this.getLineNumberFromIndex(index);

    // [text, text2, ''] // NLC = 2
    // ABCD
    // ABCtext
    // text2
    // D

    text = textArray.shift();

    // Inerting Text
    if(text){
      this.insertTextToLine(lineNumber, text, cursor);
      cursor += text.length
    }
    
    while(newLineCount){
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

    doc1.printLines();

  }

  doc.insertText = function(index, text){
    console.log('\n\n--------------------------')
    let textArray = text.split('\n').filter(Boolean) // Get rid of empty Strings // '\n'.split('\n') = ['', ''].filter(Boolean) = ['', ''].filter(function(x) { return Boolean(x); }); = [] 
    let newLineCount = textArray.length - 1;
    let lineNumber = 0;
    console.log(`(1) textArray [${textArray}] | newLineCount ${newLineCount} | nextEmptySlot ${this.nextEmptySlot}`)
    
    
    if(!textArray.length){
      [lineNumber, index] = this.getLineNumberFromIndex(index);
      const lineLength  =this.lines[lineNumber].getLength()
      const position =  lineLength - index
      console.log(`(2) Empty text Array, inserting a new line. lineNumber ${lineNumber} | index ${index} | lineLength ${lineLength} | position ${position}`)
      

      if(position === 0){
        console.log(`(3) Inserting new line after ${lineNumber}`)
        this.insertNewLine(lineNumber + 1);
      }
      else if(position === lineLength){
        console.log(`(4) Inserting new line before ${lineNumber}`)
        this.insertNewLine(lineNumber);
      }
      else{
        if(index <= lineLength/2){
          this.insertNewLine(lineNumber);
          this.lines[lineNumber].content.splice(0, 0, ...this.lines[lineNumber + 1].content.splice(0, index))
          console.log(`(5) Inserting new line before ${lineNumber} and coping content`)
        }
        else{
          this.insertNewLine(lineNumber + 1);
          this.lines[lineNumber + 1].content.splice(index, 0, ...this.lines[lineNumber].content.splice(index, position))
          console.log(`(6) Inserting new line after ${lineNumber} and coping content`)
        }
      }
      console.log(`(7) Printing lines`)
      doc1.printLines()
      
      return;
    }
    
    // doc1.printLines();

    while(textArray.length){
    console.log('*****')
    let text = textArray.shift()
      const textLength = text.length;
      console.log(`\t(8) Insert at index ${index} | the text ${text} | and current text length is ${textLength}`)

      if(index === (this.nextEmptySlot + this.getLength() - 1)){
        console.log(`\t(9) Inserting at last empty slot`)
        this.getLastLine().content.splice(this.nextEmptySlot, 0, ...text);
      }
      else{
        [lineNumber, index] = this.getLineNumberFromIndex(index);
        this.lines[lineNumber].content.splice(index, 0, text);
        console.log(`\t(10) Inserting at line ${lineNumber} | at index ${index}`)
      }

      console.log(`\t(12) Printing lines`)
      doc1.printLines()
      

      if(newLineCount){
        newLineCount --;
        this.insertNewLine(this.getLineNumberFromIndex(index)[0] + 1);
        console.log(`\t(13) Inserting a new line at ${this.getLineNumberFromIndex(index)[0]}`)        
      }
      index += textLength + 1;
      console.log(`\t(11) Updated index is ${index}`)

      this.nextEmptySlot += textLength
      console.log(`\t(14) Printing lines`)
      doc1.printLines()
    }

  }

  doc.getLineNumberFromIndex = function(index){
    for(let i = 0; i < this.getLength(); i++){
      // console.log(index, this.lines[i].getLength(), i)
      if(index <= this.lines[i].getLength()){
        return [i, index];
      }

      index -= this.lines[i].getLength() + 1;
    }
  }

  doc.getLineFromIndex = function(index){
    let totalLength = 0
    // let lineNumber = 0;
    for(let line of this.lines){
      totalLength += line.getLength();
      console.log(`Total Length ${totalLength}`)
      if(totalLength > index){
        return line;
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

  doc.lineToString = function(lineNumber){
    if(lineNumber < this.getLength()){
      return this.lines[lineNumber].content.join('');
    }
    else{
      throw "Line number does not exist"
    }
  }

  doc.asString = function(start = 0, end = this.getLength()){
    let text = ``;
    // console.log(start, end)
    for(let lineNumber = start; lineNumber < end; lineNumber++){
      text += this.lineToString(lineNumber);
      text += '\n'
    }

    return text
  }

  doc.logContents = function(){
    console.log(this.asString());
    return;
  }
  
  return doc;

  // doc.insertNewLine = function (){
  //   this.lines.push(newLine());
  // }

  // doc.getLastLine = function(){
  //   return this.lines[this.getLength() - 1];
  // }

  // doc.insertChar = function(char){
  //   const lastLine = this.getLastLine();
    
  //   if(typeof(char) === 'string'){
  //     if(char === '\n'){
  //       // console.log("\n Inserted New Line")
  //       this.insertNewLine()
  //     }
  //     else{
  //       // console.log("\n Inserted char")
  //       lastLine.content.push(char)
  //     }
      
  //   }else{
  //     throw "Char is not a string";
  //   }
  // }

  // doc.insertString = function(string){
  //   for(let char of string){
  //     this.insertChar(char);
  //   }
  // }
}


// console.log(doc.getLastLine());

let doc1 = newDocument()
doc1.insertNewLine()


const firstLine = newLine();
editor_1.on("text-change", handler1)

let delta1 = [];

function handler1(delta, oldDelta){
  let operations = delta.ops
  delta1.push(operations);
  // console.log(operations)
  let index = 0;

  for(let operationObj of operations){
    
    for(let operationArray of Object.entries(operationObj)){
      let operation = operationArray[0];
      let operationValue= operationArray[1];

      if(operation === 'retain'){
          index = operationValue;
      }
      
      // else if(operation === 'delete'){
      //   let deleteCount = operationValue
      //   doc1.del
      
      // }

      else if(operation === 'insert'){
        // console.log("\n\nInsert Text Called")
        doc1.insertText2(index, operationValue)
        // for(let char of operationValue){
          // if(char === '\n'){
          //   doc1.insertNewLine()
          // }else{
          //   doc1.insertChar(char);
        // }
      }

    }
  }
  // console.log("\n----------\nDocument 1 Lines")
  // doc1.printLines();
}
////////////
const delta2 = []
editor_2.on("text-change", handler2)

function handler2(delta, oldDelta){
  let operations = delta.ops
  delta2.push(operations);
  console.log('User 2 (right) prints operations:', operations);
}
