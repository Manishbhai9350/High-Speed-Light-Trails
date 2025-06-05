import { App } from "./App";

const MetaData = {
  title:'Lights - Three JS'
}


const container = document.getElementById("app");
console.log("Container", container);
const myApp = new App(container);
myApp.loadAssets().then(myApp.init);


document.head.title = MetaData.title
