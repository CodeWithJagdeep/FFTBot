!function(e,t){const n="done",o=e.uniqueId+e.name+"_"+(Array.isArray(t)?t.join("_"):"");if(e.uniqueId&&Window.prototype.toString[o]===n)return;const a=t?[].concat(e).concat(t):[e];try{(function(e){window.adsbygoogle={loaded:!0,push(e){if(void 0===this.length&&(this.length=0,this.length+=1),null!==e&&e instanceof Object&&"Object"===e.constructor.name)for(var t=0,n=Object.keys(e);t<n.length;t++){var o=n[t];if("function"==typeof e[o])try{e[o].call(this,{})}catch(e){}}}};for(var t=document.querySelectorAll(".adsbygoogle"),n="height:1px!important;max-height:1px!important;max-width:1px!important;width:1px!important;",o="aswift_",a="google_ads_iframe_",i=!1,c=0;c<t.length;c+=1){var r=t[c].childNodes,d=r.length,l=!1;if(d>0&&(l=2===d&&"iframe"===r[0].nodeName.toLowerCase()&&r[0].id.includes(o)&&"iframe"===r[1].nodeName.toLowerCase()&&r[1].id.includes(a)),!l){t[c].setAttribute("data-adsbygoogle-status","done");var s=document.createElement("iframe");s.id="".concat(o).concat(c),s.style=n,t[c].appendChild(s);var m=document.createElement("iframe");s.contentWindow.document.body.appendChild(m);var u=document.createElement("iframe");u.id="".concat(a).concat(c),u.style=n,t[c].appendChild(u);var g=document.createElement("iframe");u.contentWindow.document.body.appendChild(g),i=!0}}i&&function(e){var t="[AdGuard]";if(e.verbose){try{var n=console.trace.bind(console),o="".concat(t," ");"corelibs"===e.engine?o+=e.ruleText:(e.domainName&&(o+="".concat(e.domainName)),e.args?o+="#%#//scriptlet('".concat(e.name,"', '").concat(e.args.join("', '"),"')"):o+="#%#//scriptlet('".concat(e.name,"')")),n&&n(o)}catch(e){}"function"==typeof window.__debug&&window.__debug(e)}}(e)}).apply(this,a),e.uniqueId&&Object.defineProperty(Window.prototype.toString,o,{value:n,enumerable:!1,writable:!1,configurable:!1})}catch(e){console.log(e)}}({name:"googlesyndication-adsbygoogle",args:[]},[]);