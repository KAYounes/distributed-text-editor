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

  line.length = function (){
    return line.content.length
  };


  return line;
}



function newDocument(){
  const doc = {};
  doc.lines = []
  
  doc.getLength = function(){
    return this.lines.length;
  }

  doc.insertNewLine = function (){
    this.lines.push(newLine());
  }

  doc.getLastLine = function(){
    return this.lines[this.getLength() - 1];
  }

  doc.insertChar = function(char){
    const lastLine = this.getLastLine();

    if(typeof(char) === 'string'){
      lastLine.content.push(char)
    }else{
      throw "Char is not a string";
    }
  }

  doc.insertString = function(string){
    for(let char of string){
      this.insertChar(char);
    }
  }

  doc.printLines = function() {
    for(let line of this.lines){
      console.log(line.content);
    }
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


  return doc;
}

let doc = newDocument()
doc.insertNewLine()
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

    for(let operationObj of operations){
        let index = 0;
        
        for(let operationArray of Object.entries(operationObj)){
            let operation = operationArray[0];
            let operationValue= operationArray[1];

            if(operation === 'retain'){
                index = operationValue;
            }
            if(operation === 'insert'){
              for(let char of operationValue){
                if(char === '\n'){
                  doc1.insertNewLine()
                }else{
                  doc1.insertChar(char);
                }
              }
                
                doc1.printLines();
            }
        }
    }

}
////////////
const delta2 = []
editor_2.on("text-change", handler2)

function handler2(delta, oldDelta){
  let operations = delta.ops
  delta2.push(operations);
  console.log('User 2 (right) prints operations:', operations);
}
