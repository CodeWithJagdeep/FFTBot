!function(o,t){const n="done",e=o.uniqueId+o.name+"_"+(Array.isArray(t)?t.join("_"):"");if(o.uniqueId&&Window.prototype.toString[e]===n)return;function r(){}const a=t?[].concat(o).concat(t):[o];try{(function(o){var t=function(){};t.prototype.setDoNotTrack=r,t.prototype.setDomains=r,t.prototype.setCustomDimension=r,t.prototype.trackPageView=r;var n=function(){};n.prototype.addListener=r;var e={getTracker:t,getAsyncTracker:n};window.Piwik=e,function(o){var t="[AdGuard]";if(o.verbose){try{var n=console.trace.bind(console),e="".concat(t," ");"corelibs"===o.engine?e+=o.ruleText:(o.domainName&&(e+="".concat(o.domainName)),o.args?e+="#%#//scriptlet('".concat(o.name,"', '").concat(o.args.join("', '"),"')"):e+="#%#//scriptlet('".concat(o.name,"')")),n&&n(e)}catch(o){}"function"==typeof window.__debug&&window.__debug(o)}}(o)}).apply(this,a),o.uniqueId&&Object.defineProperty(Window.prototype.toString,e,{value:n,enumerable:!1,writable:!1,configurable:!1})}catch(o){console.log(o)}}({name:"matomo",args:[]},[]);