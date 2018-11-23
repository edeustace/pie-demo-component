/*! Built with http://stenciljs.com */
var __awaiter=this&&this.__awaiter||function(e,t,o,n){return new(o||(o=Promise))(function(i,r){function l(e){try{s(n.next(e))}catch(e){r(e)}}function a(e){try{s(n.throw(e))}catch(e){r(e)}}function s(e){e.done?i(e.value):new o(function(t){t(e.value)}).then(l,a)}s((n=n.apply(e,t||[])).next())})},__generator=this&&this.__generator||function(e,t){var o,n,i,r,l={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return r={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(r[Symbol.iterator]=function(){return this}),r;function a(r){return function(a){return function(r){if(o)throw new TypeError("Generator is already executing.");for(;l;)try{if(o=1,n&&(i=2&r[0]?n.return:r[0]?n.throw||((i=n.return)&&i.call(n),0):n.next)&&!(i=i.call(n,r[1])).done)return i;switch(n=0,i&&(r=[2&r[0],i.value]),r[0]){case 0:case 1:i=r;break;case 4:return l.label++,{value:r[1],done:!1};case 5:l.label++,n=r[1],r=[0];continue;case 7:r=l.ops.pop(),l.trys.pop();continue;default:if(!(i=(i=l.trys).length>0&&i[i.length-1])&&(6===r[0]||2===r[0])){l=0;continue}if(3===r[0]&&(!i||r[1]>i[0]&&r[1]<i[3])){l.label=r[1];break}if(6===r[0]&&l.label<i[1]){l.label=i[1],i=r;break}if(i&&l.label<i[2]){l.label=i[2],l.ops.push(r);break}i[2]&&l.ops.pop(),l.trys.pop();continue}r=t.call(e,l)}catch(e){r=[6,e],n=0}finally{o=i=0}if(5&r[0])throw r[1];return{value:r[0]?r[1]:void 0,done:!0}}([r,a])}}};PieDemo.loadBundle("mxpg4bnw",["exports"],function(e){var t=window.PieDemo.h;function o(e,t,o){void 0===o&&(o="https://pits-dot-kds-production-216220.appspot.com/bundles/");var n=t.getElementsByTagName("head")[0],i=Object.keys(e),r=function(r){var l,a=i[r],s=e[a],c=s.replace(/(?<=[a-z])\@(?:.(?!\@))+/g,""),d=t.createElement("script"),u=(l=c,function(){var e=l.split("+"),t=a.split("+");e.forEach(function(e,o){var n=window.pie.default[e],i=t[o];console.log("defining elements"),customElements.get(i)||(customElements.define(i,n.Element),customElements.define(i+"-config",n.Configure))})});d.id=a,d.onload=u,d.src=o+s+"/editor.js",n.appendChild(d)};for(var l in i)r(l)}var n,i,r=(function(e){!function(){var t={}.hasOwnProperty;function o(){for(var e=[],n=0;n<arguments.length;n++){var i=arguments[n];if(i){var r=typeof i;if("string"===r||"number"===r)e.push(i);else if(Array.isArray(i)&&i.length){var l=o.apply(null,i);l&&e.push(l)}else if("object"===r)for(var a in i)t.call(i,a)&&i[a]&&e.push(a)}}return e.join(" ")}e.exports?(o.default=o,e.exports=o):window.classNames=o}()}(n={exports:{}}),n.exports);!function(e){e[e.LOADING=0]="LOADING",e[e.READY=1]="READY",e[e.ERROR=2]="ERROR"}(i||(i={}));var l=function(){function e(){this.load=!0,this.editor=!0,this.preview=!0,this.playerControls=!0,this.state=i.LOADING,this.toggled=this.preview,this.env={mode:"gather"},this.session={},this.loadPies=function(e){o(e,document)}}return e.prototype.toggleEditor=function(){this.toggled=!this.toggled},e.prototype.watchPie=function(e){var t,n=this;console.log("pie-watch triggered"),this.package=e,this.pieName=e.substr(e.lastIndexOf("/")+1,e.length).split("@")[0],this.pieName.indexOf("-")<0&&(this.pieName="x-"+this.pieName),customElements.whenDefined(this.pieName).then(function(){return __awaiter(n,void 0,void 0,function(){var e;return __generator(this,function(t){return e=this.package.replace(/(?<=[a-z])\@(?:.(?!\@))+$/,""),this.pieController=window.pie.default[e].controller,this.updatePieModelFromController(this.model,this.session,this.env),this.state=i.READY,[2]})})}),this.load&&o(((t={})[this.pieName]=this.package,t),document)},e.prototype.updateModel=function(e){return __awaiter(this,void 0,void 0,function(){return __generator(this,function(t){return window.pie&&(console.log("model property updated"),this.configModel=e),[2]})})},e.prototype.watchConfigModel=function(e){return __awaiter(this,void 0,void 0,function(){return __generator(this,function(t){return this.configElement&&(this.configElement.model=e),this.updatePieModelFromController(e,this.session,this.env),[2]})})},e.prototype.updatePieModelFromController=function(e,t,o){return __awaiter(this,void 0,void 0,function(){var n;return __generator(this,function(i){switch(i.label){case 0:return this.pieController?(n=this,[4,this.pieController.model(e,t,o)]):[3,2];case 1:n.pieElementModel=i.sent(),this.pieElement&&(this.pieElement.model=this.pieElementModel),i.label=2;case 2:return[2]}})})},e.prototype.watchPieElementModel=function(e){this.pieElement&&(this.pieElement.model=e)},e.prototype.componentWillLoad=function(){console.log("component will load ... "),this.watchPie(this.pie),this.model&&this.updateModel(this.model)},e.prototype.componentWillUpdate=function(){console.log("component will update ... ")},e.prototype.wachConfigElement=function(e){var t=this;e&&e.addEventListener("model.updated",function(e){console.log("model.updated"),t.configModel=e.detail&&e.detail.update,t.updatePieModelFromController(t.configModel,t.session,t.env)})},e.prototype.setMode=function(e){this.env.mode=e,this.updatePieModelFromController(this.configModel,this.session,this.env)},e.prototype.customCheckBox=function(e){var o=this,n=e.label,i=e.value;return t("label",{class:"custom-checkbox",onClick:function(){return o.setMode(i)}},t("span",{class:r("circle-container",{full:e.checked})},t("i",{"data-value":i,class:"circle"})),t("span",null,n))},e.prototype.render=function(){var e=this;switch(this.state){case i.LOADING:return t("div",{id:"loading"},"Loading...");case i.ERROR:return t("div",{id:"error"},"Error...");case i.READY:console.log("rendering");var o=this.pieName,n=this.pieName+"-config";return t("div",{class:"root"},t("span",{class:"control-bar"},t("div",{class:r("authoring-header",{collapsed:!this.toggled})},t("h4",null,"Authoring View"),t("i",{class:r("fa",{"fa-caret-left":this.toggled,"fa-caret-right":!this.toggled}),onClick:function(){return e.toggleEditor()}})),t("div",{class:"student-view-header"},t("h4",null,"Student View"))),t("div",{class:"config-holder"},t("div",{class:"authoring-holder",style:{display:this.toggled?"block":"none"}},t(n,{id:"configure",ref:function(t){return e.configElement=t},model:this.model,session:this.session})),t("div",{class:"student-view-holder"},t("div",{class:"mode-config"},t("h5",null,"Mode"),t("div",{class:"modes-holder"},this.customCheckBox({label:"Gather",checked:"gather"===this.env.mode,value:"gather"}),this.customCheckBox({label:"View",checked:"view"===this.env.mode,value:"view"}),this.customCheckBox({label:"Evaluate",checked:"evaluate"===this.env.mode,value:"evaluate"}))),t(o,{id:"render",ref:function(t){console.log("Setare"),e.pieElement=t},model:this.pieElementModel,session:this.session}))))}},Object.defineProperty(e,"is",{get:function(){return"pie-demo"},enumerable:!0,configurable:!0}),Object.defineProperty(e,"properties",{get:function(){return{configElement:{state:!0,watchCallbacks:["wachConfigElement"]},configModel:{state:!0,watchCallbacks:["watchConfigModel"]},editor:{type:Boolean,attr:"editor"},env:{state:!0},load:{type:Boolean,attr:"load"},loadPies:{type:"Any",attr:"load-pies"},model:{type:"Any",attr:"model",watchCallbacks:["updateModel"]},package:{state:!0},pie:{type:String,attr:"pie",watchCallbacks:["watchPie"]},pieController:{state:!0},pieElement:{state:!0},pieElementModel:{state:!0,watchCallbacks:["watchPieElementModel"]},pieName:{state:!0},playerControls:{type:Boolean,attr:"player-controls"},preview:{type:Boolean,attr:"preview"},session:{state:!0},state:{state:!0},toggled:{state:!0}}},enumerable:!0,configurable:!0}),Object.defineProperty(e,"style",{get:function(){return"\@import url(\"https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css\");.control-bar{color:grey;display:-ms-flexbox;display:flex;font-size:16px;font-weight:700;-ms-flex-pack:justify;justify-content:space-between;width:100%}.control-bar .authoring-header{border-bottom:1px solid #db563b;-ms-flex:1;flex:1;margin-right:30px;position:relative}.control-bar .authoring-header.collapsed{max-width:20px}.control-bar .authoring-header.collapsed h4{display:none}.control-bar .authoring-header i{position:absolute;top:0;right:0}.control-bar .student-view-header{border-bottom:1px solid #db563b;-ms-flex:1 0 0px;flex:1 0 0}.authoring-holder{-ms-flex:1 0 0px;flex:1 0 0;margin-right:30px}.root{border:green}.config-holder{display:-ms-flexbox;display:flex;padding-bottom:20px;padding-top:20px;width:100%}.toggle-button{background-color:#d3d3d3;border:none;cursor:pointer;outline:none}.config-holder .student-view-holder{display:-ms-flexbox;display:flex;-ms-flex:1 0 0px;flex:1 0 0;-ms-flex-direction:column;flex-direction:column}.config-holder .student-view-holder .mode-config{-ms-flex-align:center;align-items:center;display:-ms-flexbox;display:flex;-ms-flex-pack:justify;justify-content:space-between;margin-bottom:20px}.config-holder .student-view-holder .mode-config .modes-holder{-ms-flex-align:center;align-items:center;display:-ms-flexbox;display:flex;-ms-flex:1;flex:1;-ms-flex-pack:distribute;justify-content:space-around}.custom-checkbox{display:-ms-inline-flexbox;display:inline-flex;-ms-flex-align:center;align-items:center}.custom-checkbox .circle-container{border:3px solid rgba(0,0,0,.54);border-radius:50%;display:inline-block;margin-right:5px;height:12px;padding:3px;width:12px}.custom-checkbox .circle{background:transparent;border-radius:50%;display:block;height:100%;width:100%}.custom-checkbox .circle-container.full .circle{background:#f50057}.custom-checkbox .circle-container.full{border-color:#f50057}"},enumerable:!0,configurable:!0}),e}();e.PieDemo=l,Object.defineProperty(e,"__esModule",{value:!0})});