!function(n,e){const o="done",t=n.uniqueId+n.name+"_"+(Array.isArray(e)?e.join("_"):"");if(n.uniqueId&&Window.prototype.toString[t]===o)return;const r=e?[].concat(n).concat(e):[n];try{(function(n){var e=Math.random().toString(36).slice(2,9),o=function(){throw new ReferenceError(e)};delete window.PopAds,delete window.popns,Object.defineProperties(window,{PopAds:{set:o},popns:{set:o}}),window.onerror=function(n){var e=window.onerror;return function(o){if("string"==typeof o&&o.includes(n))return!0;if(e instanceof Function){for(var t=arguments.length,r=new Array(t>1?t-1:0),i=1;i<t;i++)r[i-1]=arguments[i];return e.apply(window,[o,...r])}return!1}}(e).bind(),function(n){var e="[AdGuard]";if(n.verbose){try{var o=console.trace.bind(console),t="".concat(e," ");"corelibs"===n.engine?t+=n.ruleText:(n.domainName&&(t+="".concat(n.domainName)),n.args?t+="#%#//scriptlet('".concat(n.name,"', '").concat(n.args.join("', '"),"')"):t+="#%#//scriptlet('".concat(n.name,"')")),o&&o(t)}catch(n){}"function"==typeof window.__debug&&window.__debug(n)}}(n)}).apply(this,r),n.uniqueId&&Object.defineProperty(Window.prototype.toString,t,{value:o,enumerable:!1,writable:!1,configurable:!1})}catch(n){console.log(n)}}({name:"prevent-popads-net",args:[]},[]);