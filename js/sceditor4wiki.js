
// ---------------------------------------
// --- SCEditor4Wiki ---------------------
// ---------------------------------------
// --- Version:   3.2.15
// --- Date/Time: 2025/12/06 12:38:01
// ---------------------------------------
/*! sceditor4wiki
 * Based on SCEditor by Sam Clarke - https://github.com/samclarke/SCEditor
 * Released under the MIT license
 *
 * Created: 2016/12/28
 * Build:   2025/12/06 12:38:01
 * Repository of current build: https://github.com/niebert/sceditor4wiki
 *
 * This repository is used for educational purpose for the Wikiversity Learning resource
 * https://en.wikiversity.org/wiki/AppLSAC
 */

// Configuration Code:
// the configuration code will be used to create some constants

(function () {
	'use strict';

  	function isTypeof(type, arg) {
  		return typeof arg === type;
  	}

  	var isString = isTypeof.bind(null, 'string');

  	var isUndefined = isTypeof.bind(null, 'undefined');

  	var isFunction = isTypeof.bind(null, 'function');

  	var isNumber = isTypeof.bind(null, 'number');

  	function isEmptyObject(obj) {
  		return !Object.keys(obj).length;
  	}

  	function extend(targetArg, sourceArg) {
  		var isTargetBoolean = targetArg === !!targetArg;
  		var i      = isTargetBoolean ? 2 : 1;
  		var target = isTargetBoolean ? sourceArg : targetArg;
  		var isDeep = isTargetBoolean ? targetArg : false;

  		function isObject(value) {
  			return value !== null && typeof value === 'object' &&
  				Object.getPrototypeOf(value) === Object.prototype;
  		}

  		for (; i < arguments.length; i++) {
  			var source = arguments[i];

  			for (var key in source) {
  				var targetValue = target[key];
  				var value = source[key];

  				if (isUndefined(value)) {
  					continue;
  				}

  				if (key === '__proto__' || key === 'constructor') {
  					continue;
  				}

  				var isValueObject = isObject(value);
  				var isValueArray = Array.isArray(value);

  				if (isDeep && (isValueObject || isValueArray)) {

  					var isSameType = isObject(targetValue) === isValueObject &&
  						Array.isArray(targetValue) === isValueArray;

  					target[key] = extend(
  						true,
  						isSameType ? targetValue : (isValueArray ? [] : {}),
  						value
  					);
  				} else {
  					target[key] = value;
  				}
  			}
  		}

  		return target;
  	}

  	function arrayRemove(arr, item) {
  		var i = arr.indexOf(item);

  		if (i > -1) {
  			arr.splice(i, 1);
  		}
  	}

  	function each(obj, fn) {
  		if (Array.isArray(obj) || 'length' in obj && isNumber(obj.length)) {
  			for (var i = 0; i < obj.length; i++) {
  				fn(i, obj[i]);
  			}
  		} else {
  			Object.keys(obj).forEach(function (key) {
  				fn(key, obj[key]);
  			});
  		}
  	}

    	function toFloat(value) {
    		value = parseFloat(value);

    		return isFinite(value) ? value : 0;
    	}

	var ELEMENT_NODE = 1;

	var TEXT_NODE = 3;

	var COMMENT_NODE = 8;

	var blockLevelList = '|body|hr|p|div|h1|h2|h3|h4|h5|h6|address|pre|' +
			'form|table|caption|tbody|thead|tfoot|th|tr|td|li|ol|ul|blockquote|center|' +
			'details|section|article|aside|nav|main|header|hgroup|footer|fieldset|' +
			'dl|dt|dd|figure|figcaption|';

	var noChildrenList = '|iframe|area|base|basefont|br|col|frame|hr|img|input|wbr' +
		'|isindex|link|meta|param|command|embed|keygen|source|track|' +
		'object|';
function getString4TextNode(elem) {
  var vDIV = document.createElement("div");
  vDIV.appendChild(elem.cloneNode(true));
  var str = vDIV.innerHTML;
  remove(vDIV);
  return str;
}

function copy2editor(src,dest,wysiwygDocument) {
  
  if (src && dest) {
    if (src.hasChildNodes()) {
      let children = src.childNodes;
      for (var elem of children) {
        
        var tag = elem.tagName;
        if (tag) {
          var attrs = elem.attributes;
          var editelem = createElement(tag,attrs,wysiwygDocument);
          dest.appendChild(editelem);
          copy2editor(elem,editelem,wysiwygDocument);
        } else {

          var str = getString4TextNode(elem);
          if (str) {
            var vTextNode = wysiwygDocument.createTextNode(str);
            dest.appendChild(vTextNode);
          }
        }
        
      }
    }

  }

}

function find_closing_bracket(expression,closebracket,startsearch_at){
    var openbracket = "-";
    var sqbracket2 = false;
    if (closebracket == "[[") {
      closebracket = "[";
      sqbracket2 = true;
    };
    var vResult = {
      "start_search": (startsearch_at || 0),
      "openbracket_at": -1,
      "closebracket_at": -1
    };
    switch (closebracket) {
      case "]":
          openbracket = "[";
      break;
      case "}":
          openbracket = "{";
      break;
      case ")":
          openbracket = "(";
      break;
      case ">":
          openbracket = "<";
      break;
      default:
          
          openbracket = "-";
    }
    if (openbracket != "-") {
      var index = startsearch_at;

      while ((index < expression.length) && (expression.charAt(index)!=openbracket)) {
        index++;
      }
      if (index < expression.length) {
        vResult.openbracket_at = index;
        
        var bracket_stack = [];

        while (index < expression.length){

            if (expression.charAt(index) == openbracket) {

              bracket_stack.push(expression.charAt(index));
            } else {

              if (expression.charAt(index) == closebracket) {
                bracket_stack.pop();
                if (bracket_stack.length == 0) {
                  
                  vResult.closebracket_at = index;
                  index = expression.length; 
                }
              }
            }
            index++;
        }

      } else {
        console.error("Opening Bracket not found in expression");
      }
    }
    return vResult;
}

function find_opening_bracket(expression,openbracket,startsearch_at){

    var closebracket = "-";
    var sqbracket2 = false;
    if (openbracket == "[[") {
      openbracket = "[";
      sqbracket2 = true;
    };
    var pos_end = 0;
    if (expression && expression.length > 0) {
      startsearch_at = (startsearch_at || expression.length-1)
    }
    var vResult = {
      "start_search": startsearch_at,
      "openbracket_at": -1,
      "closebracket_at": -1
    };
    switch (openbracket) {
      case "[":
          closebracket = "]";
      break;
      case "{":
          closebracket = "}";
      break;
      case "(":
          closebracket = ")";
      break;
      case "<":
          closebracket = ">";
      break;
      default:
          
          openbracket = "-";
    }
    if (openbracket != "-") {
      var index = startsearch_at;

      while ((index >=0) && (expression.charAt(index)!=closebracket)) {
        index--;
      }

      if (index >= 0) {
        vResult.closebracket_at = index;

        var bracket_stack = [];

        while (index >= 0){

            if (expression.charAt(index) == closebracket) {

              bracket_stack.push(expression.charAt(index));
            } else {

              if (expression.charAt(index) == openbracket) {
                bracket_stack.pop();
                
                if (bracket_stack.length == 0) {
                  
                  vResult.openbracket_at = index;
                  index = -1; 
                }
              }
            }
            index--;
        }

      } else {
        console.error("Opening Bracket not found in expression.");
      }
    }
    return vResult;
}

function traverse(node, func, innermostFirst, siblingsOnly, reverse) {
  node = reverse ? node.lastChild : node.firstChild;

  while (node) {
    var next = reverse ? node.previousSibling : node.nextSibling;

    if (
      (!innermostFirst && func(node) === false) ||
      (!siblingsOnly && traverse(
        node, func, innermostFirst, siblingsOnly, reverse
      ) === false) ||
      (innermostFirst && func(node) === false)
    ) {
      return false;
    }

    node = next;
  }
}

function rTraverse(node, func, innermostFirst, siblingsOnly) {
  traverse(node, func, innermostFirst, siblingsOnly, true);
}

function parseHTML(html, context) {
  context = context || document;

  var	ret = context.createDocumentFragment();
  var tmp = createElement('div', {}, context);

  tmp.innerHTML = html;

  while (tmp.firstChild) {
    appendChild(ret, tmp.firstChild);
  }

  return ret;
}

	var VALID_SCHEME_REGEX =
		/^(https?|s?ftp|mailto|spotify|skype|ssh|teamspeak|tel):|(\/\/)|data:image\/(png|bmp|gif|p?jpe?g);/i;

	function regex(str) {
		return str.replace(/([\-.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
	}
	
	function entities(str, noQuotes) {
		if (!str) {
			return str;
		}

		var replacements = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'  ': '&nbsp; ',
			'\r\n': '<br />',
			'\r': '<br />',
			'\n': '<br />'
		};

		if (noQuotes !== false) {
			replacements['"']  = '&#34;';
			replacements['\''] = '&#39;';
			replacements['`']  = '&#96;';
		}

		str = str.replace(/ {2}|\r\n|[&<>\r\n'"`]/g, function (match) {
			return replacements[match] || match;
		});

		return str;
	}
	
	function uriScheme(url) {
		var	path,
			
			hasScheme = /^[^\/]*:/i,
			location = window.location;

		if ((!url || !hasScheme.test(url)) || VALID_SCHEME_REGEX.test(url)) {
			return url;
		}

		path = location.pathname.split('/');
		path.pop();

		return location.protocol + '/' + '/' +
			location.host +
			path.join('/') + '/' +
			url;
	}

	var vCount = 0; 

	function get_unique_id(prefix) {
			prefix = prefix || "T";
      var timeInMs = Date.now();
      vCount++;
      var vID = prefix + timeInMs + "C" + vCount;
      
      return vID;
  }

	function check_firefox() {
		var vBool = false;
		if (navigator) {
			var browser = navigator.userAgent.toLowerCase();
			if (browser.indexOf('firefox') > -1) {
	    	console.log('Browser is Firefox');
				vBool = true;
			};
		}
		return vBool;
	}

	function check_chrome() {
		
    return !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
	}

	function createElement(tag, attributes, context) {
		var node = (context || document).createElement(tag);

		each(attributes || {}, function (key, value) {
			if (key === 'style') {
				node.style.cssText = value;
			} else if (key in node) {
				node[key] = value;
			} else {
				node.setAttribute(key, value);
			}
		});

		return node;
	}

	function parent(node, selector) {
		var parent = node || {};

		while ((parent = parent.parentNode) && !/(9|11)/.test(parent.nodeType)) {
			if (!selector || is(parent, selector)) {
				return parent;
			}
		}
	}

	function closest(node, selector) {
		return is(node, selector) ? node : parent(node, selector);
	}

	function remove(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	function removeChildNodes(parent) {
		if (parent) {
			while (parent.firstChild) {
	        parent.removeChild(parent.firstChild);
	    }
		}
	}

	function removeChildren4Tag(parent,tag) {
		var node;
		if (parent) {
			node = parent.lastChild;
	    while(node) {
				var prevNode = node.previousSibling;
				if (node.tagName && node.tagName == tag) {
					
					remove(node);
				} else {
					removeChildren4Tag(node,tag)
				}
				node = prevNode
    	}
    }
	}
	
	function appendChild(node, child) {
		node.appendChild(child);
	}

	function find(node, selector) {
		return node.querySelectorAll(selector);
	}

   var EVENT_CAPTURE = true;

 	function on(node, events, selector, fn, capture) {
 		events.split(' ').forEach(function (event) {
 			var handler;

 			if (isString(selector)) {
 				handler = fn['_sce-event-' + event + selector] || function (e) {
 					var target = e.target;
 					while (target && target !== node) {
 						if (is(target, selector)) {
 							fn.call(target, e);
 							return;
 						}

 						target = target.parentNode;
 					}
 				};

 				fn['_sce-event-' + event + selector] = handler;
 			} else {
 				handler = selector;
 				capture = fn;
 			}

 			node.addEventListener(event, handler, capture || false);
 		});
 	}

 	function off(node, events, selector, fn, capture) {
 		events.split(' ').forEach(function (event) {
 			var handler;

 			if (isString(selector)) {
 				handler = fn['_sce-event-' + event + selector];
 			} else {
 				handler = selector;
 				capture = fn;
 			}

 			node.removeEventListener(event, handler, capture || false);
 		});
 	}

 	function attr(node, attr, value) {
 		if (arguments.length < 3) {
 			return node.getAttribute(attr);
 		}

 		if (value == null) {
 			removeAttr(node, attr);
 		} else {
 			node.setAttribute(attr, value);
 		}
 	}

 	function removeAttr(node, attr) {
 		node.removeAttribute(attr);
 	}

 	function hide(node) {
 		css(node, 'display', 'none');
 	}

 	function show(node) {
 		css(node, 'display', '');
 	}

 	function toggle(node) {
 		if (isVisible(node)) {
 			hide(node);
 		} else {
 			show(node);
 		}
 	}

 	function css(node, rule, value) {
 		if (arguments.length < 3) {
 			if (isString(rule)) {
 				return node.nodeType === 1 ? getComputedStyle(node)[rule] : null;
 			}

 			each(rule, function (key, value) {
 				css(node, key, value);
 			});
 		} else {

 			var isNumeric = (value || value === 0) && !isNaN(value);
 			node.style[rule] = isNumeric ? value + 'px' : value;
 		}
 	}

 	function data(node, key, value) {
 		var argsLength = arguments.length;
 		var data = {};

 		if (node.nodeType === ELEMENT_NODE) {
 			if (argsLength === 1) {
 				each(node.attributes, function (_, attr) {
 					if (/^data\-/i.test(attr.name)) {
 						data[attr.name.substr(5)] = attr.value;
 					}
 				});

 				return data;
 			}

 			if (argsLength === 2) {
 				return attr(node, 'data-' + key);
 			}

 			attr(node, 'data-' + key, String(value));
 		}
 	}

 	function is(node, selector) {
 		var result = false;

 		if (node && node.nodeType === ELEMENT_NODE) {
 			result = (node.matches || node.msMatchesSelector ||
 				node.webkitMatchesSelector).call(node, selector);
 		}

 		return result;
 	}

 	function contains(node, child) {
 		return node !== child && node.contains && node.contains(child);
 	}

 	function previousElementSibling(node, selector) {
 		var prev = node.previousElementSibling;

 		if (selector && prev) {
 			return is(prev, selector) ? prev : null;
 		}

 		return prev;
 	}

 	function insertBefore(node, refNode) {
 		return refNode.parentNode.insertBefore(node, refNode);
 	}

 	function classes(node) {
 		return node.className.trim().split(/\s+/);
 	}

 	function hasClass(node, className) {
 		return is(node, '.' + className);
 	}

 	function addClass(node, className) {
 		var classList = classes(node);

 		if (classList.indexOf(className) < 0) {
 			classList.push(className);
 		}

 		node.className = classList.join(' ');
 	}

 	function removeClass(node, className) {
 		var classList = classes(node);

 		arrayRemove(classList, className);

 		node.className = classList.join(' ');
 	}

 	function toggleClass(node, className, state) {
 		state = isUndefined(state) ? !hasClass(node, className) : state;

 		if (state) {
 			addClass(node, className);
 		} else {
 			removeClass(node, className);
 		}
 	}

 	function width(node, value) {
 		if (isUndefined(value)) {
 			var cs = getComputedStyle(node);
 			var padding = toFloat(cs.paddingLeft) + toFloat(cs.paddingRight);
 			var border = toFloat(cs.borderLeftWidth) + toFloat(cs.borderRightWidth);

 			return node.offsetWidth - padding - border;
 		}

 		css(node, 'width', value);
 	}

 	function height(node, value) {
 		if (isUndefined(value)) {
 			var cs = getComputedStyle(node);
 			var padding = toFloat(cs.paddingTop) + toFloat(cs.paddingBottom);
 			var border = toFloat(cs.borderTopWidth) + toFloat(cs.borderBottomWidth);

 			return node.offsetHeight - padding - border;
 		}

 		css(node, 'height', value);
 	}

 	function isVisible(node) {
 		return !!node.getClientRects().length;
 	}

 	function camelCase(string) {
 		return string
 			.replace(/^-ms-/, 'ms-')
 			.replace(/-(\w)/g, function (match, char) {
 				return char.toUpperCase();
 			});
 	}

  	function hasStyling(node) {
  		return node && (!is(node, 'p,div') || node.className ||
  			attr(node, 'style') || !isEmptyObject(data(node)));
  	}

  	function convertElement(element, toTagName) {
  		var newElement = createElement(toTagName, {}, element.ownerDocument);

  		each(element.attributes, function (_, attribute) {

  			try {
  				attr(newElement, attribute.name, attribute.value);
  			} catch (ex) {}
  		});

  		while (element.firstChild) {
  			appendChild(newElement, element.firstChild);
  		}

  		element.parentNode.replaceChild(newElement, element);

  		return newElement;
  	}

		function canHaveChildren(node) {

			if (!/11?|9/.test(node.nodeType)) {
				return false;
			}

			return noChildrenList.indexOf('|' + node.nodeName.toLowerCase() + '|') < 0;
		}

		function isInline(elm, includeCodeAsBlock) {
			var tagName,
				nodeType = (elm || {}).nodeType || TEXT_NODE;

			if (nodeType !== ELEMENT_NODE) {
				return nodeType === TEXT_NODE;
			}

			tagName = elm.tagName.toLowerCase();

			if (tagName === 'code') {
				return !includeCodeAsBlock;
			}

			return blockLevelList.indexOf('|' + tagName + '|') < 0;
		}

		function copyCSS(from, to) {
			if (to.style && from.style) {
				to.style.cssText = from.style.cssText + to.style.cssText;
			}
		}

		function isEmpty(node) {
			if (node.lastChild && isEmpty(node.lastChild)) {
				remove(node.lastChild);
			}

			return node.nodeType === 3 ? !node.nodeValue :
				(canHaveChildren(node) && !node.childNodes.length);
		}

		function fixNesting(node) {
			traverse(node, function (node) {
				
	 			var list = 'ul,ol',
					isBlock = !isInline(node, true) && node.nodeType !== COMMENT_NODE,
					parent = node.parentNode;

				if (isBlock && (isInline(parent, true) || parent.tagName === 'P')) {
					
					var	lastInlineParent = node;
					while (isInline(lastInlineParent.parentNode, true) ||
						lastInlineParent.parentNode.tagName === 'P') {
						lastInlineParent = lastInlineParent.parentNode;
					}

					var before = extractContents(lastInlineParent, node);
					var middle = node;

					while (parent && isInline(parent, true)) {
						if (parent.nodeType === ELEMENT_NODE) {
							var clone = parent.cloneNode();
							while (middle.firstChild) {
								appendChild(clone, middle.firstChild);
							}

							appendChild(middle, clone);
						}
						parent = parent.parentNode;
					}

					insertBefore(middle, lastInlineParent);
					if (!isEmpty(before)) {
						insertBefore(before, middle);
					}
					if (isEmpty(lastInlineParent)) {
						remove(lastInlineParent);
					}
				}

				if (isBlock && is(node, list) && is(node.parentNode, list)) {
					var li = previousElementSibling(node, 'li');

					if (!li) {
						li = createElement('li');
						insertBefore(li, node);
					}

					appendChild(li, node);
				}
			});
		}

		function findCommonAncestor(node1, node2) {
			while ((node1 = node1.parentNode)) {
				if (contains(node1, node2)) {
					return node1;
				}
			}
		}

		function getSibling(node, previous) {
			if (!node) {
				return null;
			}

			return (previous ? node.previousSibling : node.nextSibling) ||
				getSibling(node.parentNode, previous);
		}

		function removeWhiteSpace(root) {
			var	nodeValue, nodeType, next, previous, previousSibling,
				nextNode, trimStart,
				cssWhiteSpace = css(root, 'whiteSpace'),
				
				preserveNewLines = /line$/i.test(cssWhiteSpace),
				node = root.firstChild;

			if (/pre(\-wrap)?$/i.test(cssWhiteSpace)) {
				return;
			}

			while (node) {
				nextNode  = node.nextSibling;
				nodeValue = node.nodeValue;
				nodeType  = node.nodeType;

				if (nodeType === ELEMENT_NODE && node.firstChild) {
					removeWhiteSpace(node);
				}

				if (nodeType === TEXT_NODE) {
					next      = getSibling(node);
					previous  = getSibling(node, true);
					trimStart = false;

					while (hasClass(previous, 'sceditor-ignore')) {
						previous = getSibling(previous, true);
					}

					if (isInline(node) && previous) {
						previousSibling = previous;

						while (previousSibling.lastChild) {
							previousSibling = previousSibling.lastChild;

							while (hasClass(previousSibling, 'sceditor-ignore')) {
								previousSibling = getSibling(previousSibling, true);
							}
						}

						trimStart = previousSibling.nodeType === TEXT_NODE ?
							/[\t\n\r ]$/.test(previousSibling.nodeValue) :
							!isInline(previousSibling);
					}

					nodeValue = nodeValue.replace(/\u200B/g, '');

					if (!previous || !isInline(previous) || trimStart) {
						nodeValue = nodeValue.replace(
							preserveNewLines ? /^[\t ]+/ : /^[\t\n\r ]+/,
							''
						);
					}

					if (!next || !isInline(next)) {
						nodeValue = nodeValue.replace(
							preserveNewLines ? /[\t ]+$/ : /[\t\n\r ]+$/,
							''
						);
					}

					if (!nodeValue.length) {
						remove(node);
					} else {
						node.nodeValue = nodeValue.replace(
							preserveNewLines ? /[\t ]+/g : /[\t\n\r ]+/g,
							' '
						);
					}
				}

				node = nextNode;
			}
		}

		function extractContents(startNode, endNode) {
			var range = startNode.ownerDocument.createRange();

			range.setStartBefore(startNode);
			range.setEndAfter(endNode);

			return range.extractContents();
		}

		function getOffset(node) {
			var	left = 0,
				top = 0;

			while (node) {
				left += node.offsetLeft;
				top  += node.offsetTop;
				node  = node.offsetParent;
			}

			return {
				left: left,
				top: top
			};
		}

		var cssPropertyNameCache = {};
		
		function getStyle(elm, property) {
			var	styleValue,
				elmStyle = elm.style;

			if (!cssPropertyNameCache) cssPropertyNameCache = {};

			if (!cssPropertyNameCache[property]) {
				cssPropertyNameCache[property] = camelCase(property);
			}

			property   = cssPropertyNameCache[property];
			styleValue = elmStyle[property];

			if ('textAlign' === property) {
				styleValue = styleValue || css(elm, property);

				if (css(elm.parentNode, property) === styleValue ||
					css(elm, 'display') !== 'block' || is(elm, 'hr,th')) {
					return '';
				}
			}

			return styleValue;
		}

		function hasStyle(elm, property, values) {
			var styleValue = getStyle(elm, property);

			if (!styleValue) {
				return false;
			}

			return !values || styleValue === values ||
				(Array.isArray(values) && values.indexOf(styleValue) > -1);
		}

		function stylesMatch(nodeA, nodeB) {
			var i = nodeA.style.length;
			if (i !== nodeB.style.length) {
				return false;
			}

			while (i--) {
				var prop = nodeA.style[i];
				if (nodeA.style[prop] !== nodeB.style[prop]) {
					return false;
				}
			}

			return true;
		}

		function attributesMatch(nodeA, nodeB) {
			var i = nodeA.attributes.length;
			if (i !== nodeB.attributes.length) {
				return false;
			}

			while (i--) {
				var prop = nodeA.attributes[i];
				var notMatches = prop.name === 'style' ?
					!stylesMatch(nodeA, nodeB) :
					prop.value !== attr(nodeB, prop.name);

				if (notMatches) {
					return false;
				}
			}

			return true;
		}

		function removeKeepChildren(node) {
			while (node.firstChild) {
				insertBefore(node.firstChild, node);
			}

			remove(node);
		}

		function merge(node) {
			if (node.nodeType !== ELEMENT_NODE) {
				return;
			}

			var parent = node.parentNode;
			var tagName = node.tagName;
			var mergeTags = /B|STRONG|EM|SPAN|FONT/;

			var i = node.childNodes.length;
			while (i--) {
				merge(node.childNodes[i]);
			}

			if (!isInline(node)) {
				return;
			}

			i = node.style.length;
			while (i--) {
				var prop = node.style[i];
				if (css(parent, prop) === css(node, prop)) {
					node.style.removeProperty(prop);
				}
			}

			if (!node.style.length) {
				removeAttr(node, 'style');

				if (tagName === 'FONT') {
					if (css(node, 'fontFamily').toLowerCase() ===
						css(parent, 'fontFamily').toLowerCase()) {
						removeAttr(node, 'face');
					}

					if (css(node, 'color') === css(parent, 'color')) {
						removeAttr(node, 'color');
					}

					if (css(node, 'fontSize') === css(parent, 'fontSize')) {
						removeAttr(node, 'size');
					}
				}

				if (!node.attributes.length && /SPAN|FONT/.test(tagName)) {
					removeKeepChildren(node);
				} else if (mergeTags.test(tagName)) {
					var isBold = /B|STRONG/.test(tagName);
					var isItalic = tagName === 'EM';

					while (parent && isInline(parent) &&
						(!isBold || /bold|700/i.test(css(parent, 'fontWeight'))) &&
						(!isItalic || css(parent, 'fontStyle') === 'italic')) {

						if ((parent.tagName === tagName ||
							(isBold && /B|STRONG/.test(parent.tagName))) &&
							attributesMatch(parent, node)) {
							removeKeepChildren(node);
							break;
						}

						parent = parent.parentNode;
					}
				}
			}

			var next = node.nextSibling;
			if (next && next.tagName === tagName && attributesMatch(next, node)) {
				appendChild(node, next);
				removeKeepChildren(next);
			}
		}

		function fixFirefoxListBug(editor) {
			
			if ('mozHidden' in document) {
				var node = editor.getBody();
				var next;

				while (node) {
					next = node;

					if (next.firstChild) {
						next = next.firstChild;
					} else {

						while (next && !next.nextSibling) {
							next = next.parentNode;
						}

						if (next) {
							next = next.nextSibling;
						}
					}

					if (node.nodeType === 3 && /[\n\r\t]+/.test(node.nodeValue)) {
						
						if (!/^pre/.test(css(node.parentNode, 'whiteSpace'))) {
							remove(node);
						}
					}

					node = next;
				}
			}
		}

	var EVENT_CAPTURE = true;

function trigger(node, eventName, data) {
  var event;

  if (isFunction(window.CustomEvent)) {
    event = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: true,
      detail: data
    });
  } else {
    event = node.ownerDocument.createEvent('CustomEvent');
    event.initCustomEvent(eventName, true, true, data);
  }

  node.dispatchEvent(event);
}

	function on(node, events, selector, fn, capture) {
		events.split(' ').forEach(function (event) {
			var handler;

			if (isString(selector)) {
				handler = fn['_sce-event-' + event + selector] || function (e) {
					var target = e.target;
					while (target && target !== node) {
						if (is(target, selector)) {
							fn.call(target, e);
							return;
						}

						target = target.parentNode;
					}
				};

				fn['_sce-event-' + event + selector] = handler;
			} else {
				handler = selector;
				capture = fn;
			}

			node.addEventListener(event, handler, capture || false);
		});
	}

	function off(node, events, selector, fn, capture) {
		events.split(' ').forEach(function (event) {
			var handler;

			if (isString(selector)) {
				handler = fn['_sce-event-' + event + selector];
			} else {
				handler = selector;
				capture = fn;
			}

			node.removeEventListener(event, handler, capture || false);
		});
	}

var defaultOptions = {

  toolbar: 'load,save,bold,italic,underline,strike,subscript,superscript|' +
    'left,center,right,justify|header,font,size,color,removeformat|' +
    'cut,copy,pastetext|bulletlist,orderedlist,indent,outdent|' +
    'table|code,quote|horizontalrule,image,email,link,unlink|' +
    'emoticon,youtube,mathexpr,date,time|ltr,rtl|print,maximize,source',

  toolbarExclude: null,

  style: 'jquery.sceditor.default.css',

  fonts: 'Arial,Arial Black,Comic Sans MS,Courier New,Georgia,Impact,' +
    'Sans-serif,Serif,Times New Roman,Trebuchet MS,Verdana',

  colors: '#000000,#44B8FF,#1E92F7,#0074D9,#005DC2,#00369B,#b3d5f4|' +
      '#444444,#C3FFFF,#9DF9FF,#7FDBFF,#68C4E8,#419DC1,#d9f4ff|' +
      '#666666,#72FF84,#4CEA5E,#2ECC40,#17B529,#008E02,#c0f0c6|' +
      '#888888,#FFFF44,#FFFA1E,#FFDC00,#E8C500,#C19E00,#fff5b3|' +
      '#aaaaaa,#FFC95F,#FFA339,#FF851B,#E86E04,#C14700,#ffdbbb|' +
      '#cccccc,#FF857A,#FF5F54,#FF4136,#E82A1F,#C10300,#ffc6c3|' +
      '#eeeeee,#FF56FF,#FF30DC,#F012BE,#D900A7,#B20080,#fbb8ec|' +
      '#ffffff,#F551FF,#CF2BE7,#B10DC9,#9A00B2,#9A00B2,#e8b6ef',

  locale: attr(document.documentElement, 'lang') || 'en',

  charset: 'utf-8',

  emoticonsCompat: false,

  emoticonsEnabled: true,

  emoticonsRoot: '',
  emoticons: {
    dropdown: {
      ':)': 'emoticons/smile.png',
      ':angel:': 'emoticons/angel.png',
      ':angry:': 'emoticons/angry.png',
      '8-)': 'emoticons/cool.png',
      ':\'(': 'emoticons/cwy.png',
      ':ermm:': 'emoticons/ermm.png',
      ':D': 'emoticons/grin.png',
      '<3': 'emoticons/heart.png',
      ':(': 'emoticons/sad.png',
      ':O': 'emoticons/shocked.png',
      ':P': 'emoticons/tongue.png',
      ';)': 'emoticons/wink.png'
    },
    more: {
      ':alien:': 'emoticons/alien.png',
      ':blink:': 'emoticons/blink.png',
      ':blush:': 'emoticons/blush.png',
      ':cheerful:': 'emoticons/cheerful.png',
      ':devil:': 'emoticons/devil.png',
      ':dizzy:': 'emoticons/dizzy.png',
      ':getlost:': 'emoticons/getlost.png',
      ':happy:': 'emoticons/happy.png',
      ':kissing:': 'emoticons/kissing.png',
      ':ninja:': 'emoticons/ninja.png',
      ':pinch:': 'emoticons/pinch.png',
      ':pouty:': 'emoticons/pouty.png',
      ':sick:': 'emoticons/sick.png',
      ':sideways:': 'emoticons/sideways.png',
      ':silly:': 'emoticons/silly.png',
      ':sleeping:': 'emoticons/sleeping.png',
      ':unsure:': 'emoticons/unsure.png',
      ':woot:': 'emoticons/w00t.png',
      ':wassat:': 'emoticons/wassat.png'
    },
    hidden: {
      ':whistling:': 'emoticons/whistling.png',
      ':love:': 'emoticons/wub.png'
    }
  },

  width: null,

  height: null,

  resizeEnabled: true,

  resizeMinWidth: null,
  
  resizeMinHeight: null,
  
  resizeMaxHeight: null,
  
  resizeMaxWidth: null,
  
  resizeHeight: true,
  
  resizeWidth: true,

  dateFormat: 'year-month-day',

  toolbarContainer: null,

  enablePasteFiltering: false,

  disablePasting: false,

  readOnly: false,

  rtl: false,

  autofocus: false,

  autofocusEnd: true,

  autoExpand: false,

  autoUpdate: false,

  spellcheck: true,

  runWithoutWysiwygSupport: false,

  startInSourceMode: false,

  id: null,

  plugins: '',

  zIndex: null,

  bbcodeTrim: false,

  disableBlockRemove: false,

  allowedIframeUrls: [],

  parserOptions: { },

  dropDownCss: { },
  
  imageContainer: [
    {
         "name": "action-black.png",
         "path": "img",
         "used": false,
         "src": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAH1JREFUOMtjYCAOzAJiNgYywH8gPgbEkuRoBOFnQGyJLgjDDVBxNSBeDsQf0OR/AnEaAw5NdkD8BYuhWDXCAC8QvwDiH0BcB8TihJwKA/lA/BmIrQkFDrrG3UAcjhY4M5GiowGXxrl4QrcBWS26RiMiogWrRga6aSQFk68RAP5OVqWXKdm9AAAAAElFTkSuQmCC",
         "url": "https:/'+ '/jquerymobile.com/download/"
     },
     {
          "name": "info-black.png",
          "path": "img",
          "used": false,
          "src": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAJxJREFUOMul0ksKwkAQhOHvFga9hwTvIQS8TkSPZ4gX8QG6Stx0IA6TQLSgNtPzz6O6+dYGZ1zxDrc4YW1CBzzRT/iBKgd1ycYtymStG8ObiZtK7DLrdxTiT/1CH0UQaWGsHNiI5PoZOFd7/QW2P4AX0dylYC0m4jETTgrfsBoKVWYAcu6wT0+torlT0C0HDSqiuU0k94og6vHz4AMNCIcMUIkWVwAAAABJRU5ErkJggg==",
          "url": "https:/'+ '/jquerymobile.com/download/"
      }
  ]

};
function download_text_filesaver(pFilename,pContent) {
  console.log("sceditor.js:1912 - download_text_filesaver('"+pFilename+"',pContent)");
  var file = new File([pContent], {type: "text/plain;charset=utf-8"});
  window.saveAs(file,pFilename);
}

function download_text(pFilename,pData) {
  console.log("sceditor.js:1919 - download_text('"+pFilename+"',pData)");
  if (navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") === -1) {
    window.open(pData);
  } else {
    if (window.saveAs) {
      
      download_text_filesaver(pFilename,pData);
    } else {
      var a = document.createElement("a");
      a.download = pFilename;
      a.style = "display: none";
      var t = new Blob([pData], {
          type: "text/plain"
        });
      a.href = window.URL.createObjectURL(t);
      
      a.click();
    }
  }
}

function createLoadFileButton(pInstance) {
  var inputFileButton = document.createElement('input');
  inputFileButton.setAttribute("type","file");
  inputFileButton.setAttribute("style","display:none");
  inputFileButton.setAttribute("value",'Load HTML');
  inputFileButton.addEventListener('change', function (e) {
    console.log("Event 'onchange' - Input HTML File");
    
    const html_file = inputFileButton.files[0];
    const reader4html = new FileReader();

    reader4html.addEventListener("load", function () {

      var mimetype = "html-undefined";
      var raw = null;
      if (reader4html.result) {
        if (pInstance) {
          pInstance.setValue(reader4html.result);
          if (!pInstance.filename4save) {
            console.log("sceditor.js:1915 - pInstance.filename4save is not defined");
          };
          pInstance['filename4save'] = html_file.name;
        } else {
          console.log("sceditor.js:1918 - pInstance is not defined");
        }
        console.log("Load file '"+html_file.name+"' done");
      };
    }, false);

    if (html_file) {
      
      reader4html.readAsText(html_file);
    }
  });
  
  return inputFileButton;
}

var _templates = {
  html:
    '<!DOCTYPE html>' +
    '<html{attrs}>' +
      '<head>' +
        '<meta http-equiv="Content-Type" ' +
          'content="text/html;charset={charset}" />' +
        '<link rel="stylesheet" type="text/css" href="{style}" />' +
      '</head>' +
      '<body contenteditable="true" {spellcheck}><p></p>' +
      
    '</body></html>',

  toolbarButton: '<a class="sceditor-button sceditor-button-{name}" ' +
    'data-sceditor-command="{name}" unselectable="on">' +
    '<div unselectable="on">{dispName}</div></a>',

  emoticon: '<img src="{url}" data-sceditor-emoticon="{key}" ' +
    'alt="{key}" name="{tooltip}" />',

  fontOpt: '<a class="sceditor-font-option" href="#" ' +
    'data-font="{font}"><font face="{font}">{font}</font></a>',

  sizeOpt: '<a class="sceditor-fontsize-option" data-size="{size}" ' +
    'href="#"><font size="{size}">{size}</font></a>',

  headerOpt: '<a class="sceditor-headersize-option" data-size="{size}" ' +
      'href="#"><font size="{size}">{level}</font></a><br/>',
  normalOpt: '<a class="sceditor-headersize-option" data-size="{size}" ' +
          'href="#">{level}</a><br/>',

  pastetext:
    '<div><label for="txt">{label}</label> ' +
      '<textarea cols="20" rows="7" id="txt"></textarea></div>' +
      '<div><input type="button" class="button" value="{insert}" />' +
    '</div>',

  table:
    '<div><label for="rows">{rows}</label><input type="text" ' +
      'id="rows" value="2" /></div>' +
    '<div><label for="cols">{cols}</label><input type="text" ' +
      'id="cols" value="2" /></div>' +
    '<div><input type="button" class="button" value="{insert}"' +
      ' /></div>',
  
  save:
        '<div><label for="filename">{filename4save} ({default4extension})</label> ' +
          '<input type="text" id="filename4save" dir="ltr" value="{default4filename}"></div>' +
        '<div style="display:none"><label for="width">{extension4save}</label> ' +
          '<input type="text" id="extension4save" size="2" dir="ltr" value="{default4extension}"/></div>' +
        '<div><input type="button" id="button4save" class="button" value="{button4save}" />' +
          '</div>',

  image:
    '<div><label for="image">{url}</label> ' +
      '<input type="text" id="image" dir="ltr"  /></div>' +
    '<div><label for="width">{width}</label> ' +
      '<input type="text" id="width" size="2" dir="ltr" /></div>' +
    '<div><label for="height">{height}</label> ' +
      '<input type="text" id="height" size="2" dir="ltr" /></div>' +
    '<div><input type="button" class="button" value="{insert}" />' +
      '</div>',

  email:
    '<div><label for="email">{label}</label> ' +
      '<input type="text" id="email" dir="ltr" /></div>' +
    '<div><label for="des">{desc}</label> ' +
      '<input type="text" id="des" /></div>' +
    '<div><input type="button" class="button" value="{insert}" />' +
      '</div>',

  link:
    '<div><label for="link">{url}</label> ' +
      '<input type="text" id="link" dir="ltr" /></div>' +
    '<div><label for="des">{desc}</label> ' +
      '<input type="text" id="des" /></div>' +
    '<div><input type="button" class="button" value="{ins}" /></div>',

  mathMenu:
    '<div><label for="link">{label}</label> ' +
      
      '<select id="mathsource"><option>-</option><option value="equation">[]=[]</option><option value="implication">[]=&gt;</option><option value="equivalence">[]&lt;=&gt;</option><option value="functiondef">f(x)</option></select>' +
      '</div><div>' +
      '<select id="mathdisplay"><option>inline</option><option>block</option></select>' +
      '</div>' +
    '<div><input type="button" class="button" value="{insert}" />' +
      '</div>',
  mathexprXXX:
    '<math display="{mathdisplay}" mathid="{id}"> ' +
    ' {mathsource} ' +
    '</math>',
  mathexpr: '<span id="{id}" class="math{mathdisplay}">'+
  ' {mathsource} ' +
  '</span>',
  youtubeMenu:
    '<div><label for="link">{label}</label> ' +
      '<input type="text" id="link" dir="ltr"  /></div>' +
    '<div><input type="button" class="button" value="{insert}" />' +
      '</div>',

  youtube:
    '<iframe width="560" height="315" frameborder="0" allowfullscreen ' +
    'src="https:/'+
    '/www.youtube-nocookie.com/embed/{id}?wmode=opaque&start={time}" ' +
    'data-youtube-id="{id}"></iframe>'
};

function _tmpl (name, params, createHtml) {
  var template = "undefined _template['"+name+"'] ";
  if (_templates && _templates[name]) {
    template = _templates[name];
  } else {
    console.error("sceditor.js:1891 - Template _template['"+name+"'] is undefined");
  };

  Object.keys(params).forEach(function (key) {
    template = template.replace(
      new RegExp(regex('{' + key + '}'), 'g'), params[key]
    );
  });

  if (createHtml) {
    template = parseHTML(template);
  }

  return template;
}

var defaultMathCmds = [
  {
    "group":"position",
    "math4icon": "\\square_{\\square}^{\\square}",
    "btns":[
      {
        "name": "fraction",
        "math4icon": "\\frac{\\square}{\\square}",
        "latex": "\\frac{ }{ }",
      },
      {
        "name": "index",
        "math4icon": "\\square_{{}_\\square}",
        "latex": "_{ }",
      },
      {
        "name": "exponent",
        "math4icon": "{\\square}^{{}^{\\square}}",
        "latex": "^{ }"
      },
      {
        "name": "stackrel",
        "math4icon": "\\stackrel{{}_\\square}{\\square}",
        "latex": "\\stackrel{ a }{ b }"
      }
    ]
  },
  {
    "group":"operatorsbig",
    "math4icon": "\\left(\\sum \\right)",
    "btns":[
      {
        "name": "sum",
        "math4icon": "\\sum",
        "latex": "\\sum_{}^{}",
      },
      {
        "name": "integral",
        "math4icon": "\\int",
        "latex": "\\int_ {}^{}  \\, dx"
      },
      {
        "name": "integralfx",
        "math4icon": "\\int_{a}^{b}",
        "latex": "\\int_{a}^{b} f(x) \\, dx"
      },
      {
        "name": "product",
        "math4icon": "\\prod",
        "latex": "\\prod_ {}^{}"
      }
    ]
  },
  {
    "group":"multiline",
    "math4icon": "(\\equiv )",
    "btns":[
      {
        "name": "equation",
        "math4icon": "\\square = \\square",
        "latex": "\n\\begin{array}{rcl}\n  x\n   & = &\n   y \n\\\\\n   y\n   & \\leq &\n   z \n\\\\\n \\end{array}\n"
      },
      {
        "name": "implication",
        "math4icon": "\\square \\Rightarrow ",
        "latex": "\n\\begin{array}{rcll}  x\n   & = &\n   y \n   & \\Rightarrow \\\\ \n    y\n   & \\leq &\n   z\n  & \\Leftrightarrow \\\\ \n \\end{array}\n"
      },
      {
        "name": "equivalence",
        "math4icon": "\\square \\Leftrightarrow ",
        "latex": "\n\\begin{array}{rcll}\n  x & = & y & \\Leftrightarrow \\\\ \n   y & \\leq & z & \\Leftrightarrow \\\\ \n \\end{array}\n"
      },
      {
        "name": "cases",
        "math4icon": "\\{ \\equiv ",
        "latex": "\n\\begin{cases}\n  1 & , & x \\geq 0 \\\\ \n   -1 & , & x \\lt 0 \\\\ \n \\end{cases}\n"
      },
      {
        "name": "functiondef",
        "math4icon": "f(x)",
        "latex": "  \\begin{array}{rrcl} \n   f: & \\mathbb{D}_1 \\times \\mathbb{D}_2 & \\rightarrow & \\mathbb{W} \\\\ \n       &  \\left( x,y \\right)  & \\mapsto & f\\left( x,y \\right) = \n  \\end{array} "
      }
    ]
  },
  {
    "group":"operator",
    "math4icon": "(\\circ)",
    "btns":[
      {
        "name": "cdot",
        "math4icon": "\\cdot",
        "latex": "\\cdot"
      },
      {
        "name": "circ",
        "math4icon": "\\circ",
        "latex": "\\circ"
      },
      {
        "name": "approx",
        "math4icon": "\\approx",
        "latex": "\\approx"
      },
      {
        "name": "leq",
        "math4icon":"\\leq",
        "latex": "\\leq"
      },
      {
        "name": "geq",
        "math4icon":"\\geq",
        "latex": "\\geq"
      },
      {
        "name": "infinity",
        "math4icon":"\\infty",
        "latex": "\\infty"
      }

    ]
  },
  {
    "group":"matrixvector",
    "math4icon": "(\\square)",
    "btns":[
      {
        "name": "pmatrix",
        "math4icon": "(\\square)",
        "latex": "\n\\begin{pmatrix}\n  x_1 & x_2 & x_3 \\\\ \n   y_1 & y_2 & y_3 \\\\ \n \\end{pmatrix}\n"
      },
      {
        "name": "colvector",
        "math4icon": "(|)",
        "latex": "\n\\begin{pmatrix}\n  x_1 \\\\ \n x_2   \\\\  \n x_3  \n \\end{pmatrix}\n"
      },
      {
        "name": "rowvector",
        "math4icon": "(-)",
        "latex": "\n\\begin{pmatrix}\n    x_1 ,  x_2  , x_3  \n \\end{pmatrix}\n"
      },
      {
        "name": "scalarproduct",
        "math4icon":"\\langle \\square , \\square \\rangle",
        "latex": "\\langle  , \\rangle"
      },
      {
        "name": "norm",
        "math4icon": "\\|\\cdot \\|",
        "latex": " \\left\|  \\cdot \\right\\| "
      },
      {
        "name": "norm3",
        "math4icon": "|\\!|\\!| \\cdot |\\!|\\!|",
        "latex": " \\left | \\! \\left | \\! \\left | \\cdot \\right | \\! \\right | \\! \\right |"
      },
      {
        "name": "functiondef",
        "math4icon": "f(x)",
        "latex": "  \\begin{array}{rrcl} \n   f: & \\mathbb{D}_1 \\times \\mathbb{D}_2 & \\rightarrow & \\mathbb{W} \\\\ \n       &  \\left( x,y \\right)  & \\mapsto & f\\left( x,y \\right) = \n  \\end{array} "
      }
    ]
  },
  {
    "group":"Greek Letters",
    "math4icon": "(\\alpha )",
    "btns":[
      {
        "latex": "\\alpha"
      },
      {
        "latex": "\\beta"
      },
      {
        "latex": "\\gamma"
      },
      {
        "latex": "\\delta"
      },
      {
        "latex": "\\varepsilon"
      },
      {
        "latex": "\\varphi"
      },
      {
        
        "latex": "\\psi"
      },
      {
        
        "latex": "\\mu"
      }
    ]
  },
  {
    "group":"Differential",
    "math4icon": "(\\partial )",
    "btns":[
      {
        "name": "partialdiff",
        "math4icon": "\\partial f",
        "latex": "  \\frac{\\partial f}{\\partial x_i}   \\left( x,y \\right)  = "
      },
      {
        "name": "limes",
        "math4icon": "\\lim",
        "latex": " \\displaystyle \\lim_{ x \\to  x_o } "
      },
      {
        "name": "limes4top",
        "math4icon": "\\stackrel{\\mathcal{T}}{\\lim}",
        "latex": " \\stackrel{ \\mathcal{T} }{\\displaystyle  \\lim_{ x  \\to  x_o }}"
      },
      {
        "name": "diffdef",
        "math4icon": "f'(x)",
        "latex": " \\displaystyle \\lim_{x \\to x_o} \\frac{f(x) - f(x_o)}{x - x_0}  "
      },
      {
        "math4icon": "\\nabla f",
        "latex": "\\nabla f (x)"
      },
      {
        "name": "gradient",
        "math4icon": "Grad",
        "latex": " \\left( \\frac{\\partial f}{\\partial x_1}(x), \\ldots ,\\frac{\\partial f}{\\partial x_n}(x) \\right)"
      },
      {
        "latex": "\\psi",
        "exclude":true
      }
    ]
  },
  {
    "group":"Sets",
    "math4icon": "\\mathbb{M}",
    "btns":[
      {
        "name": "natural",
        "latex": "\\mathbb{N}"
      },
      {
        "name": "natural0",
        "latex": "\\mathbb{N}_{0}"
      },
      {
        "name": "rational",
        "latex": "\\mathbb{Q}"
      },
      {
        "name": "real",
        "latex": "\\mathbb{R}"
      },
      {
        "name": "complex",
        "latex": "\\mathbb{C}"
      },
      {
        "name": "mathcal",
        "math4icon": "\\mathcal{C}",
        "latex": "\\mathcal{C}"
      }
    ]
  }

];

var defaultCmds = {
  
  load: {
    exec: function (caller) {
      console.log("sceditor.js:1942 - Load HTML");
      var editor = this;
      if (!editor.loader4file) {
        console.log("sceditor.js:1990 - editor.loader4file is NOT defined - loader will be created");
        editor.loader4file = createLoadFileButton(editor);
      }
      editor.loader4file.click();
    },
    tooltip: 'Load HTML',
    shortcut: 'Ctrl+L'
  },
  save: {
    _dropDown: function (editor, caller, selected, cb) {
      var	content = createElement('div');
      var vID = get_unique_id();
      
      editor.filename4save = editor.filename4save || "myfilename";
      editor.extension4save = editor.extension4save || "html";
      editor.uniqueid4save = vID;
      appendChild(content, _tmpl('save', {
        filename4save: editor._('Filename:'),
        default4filename: editor.filename4save,
        extension4save: editor._('extension:'),
        default4extension: editor.extension4save,
        button4save: editor._('Save'),
        uniqueid: vID
      }, true));

      var	filenameInput   = find(content, '#filename4save')[0];
      var extInput    = find(content, '#extension4save')[0];
      var saveButton  = find(content, '#button4save')[0];

      if (filenameInput && extInput) {

        on(content, 'click', '.button', function (e) {
            
            cb(
              filenameInput.value,extInput.value
            );
          editor.closeDropDown(true);
          e.preventDefault();
        });
        editor.filename4save  = filenameInput.value;
        editor.extension4save = extInput.value;
      } else {

      }

      editor.createDropDown(caller, 'save4file', content);
    },
    exec: function (caller) {
      console.log("sceditor.js:1953 - Save HTML");
      var	editor  = this;

      defaultCmds.save._dropDown(
        editor,
        caller,
        '',
        function (filename, extension) {
          filename  = filename || 'file_undefined.'+extension;
          extension = extension || 'txt';

          download_text(filename,editor.getValue());
          alert("Save "+(extension.toUpperCase())+"-File '"+filename+"'");
        }
      );
    },
    tooltip: 'Save HTML',
    shortcut: 'Ctrl+S'
  },
  bold: {
    exec: 'bold',
    tooltip: 'Bold',
    shortcut: 'Ctrl+B'
  },

  italic: {
    exec: 'italic',
    tooltip: 'Italic',
    shortcut: 'Ctrl+I'
  },

  underline: {
    exec: 'underline',
    tooltip: 'Underline',
    shortcut: 'Ctrl+U'
  },

  strike: {
    exec: 'strikethrough',
    tooltip: 'Strikethrough'
  },

  subscript: {
    exec: 'subscript',
    tooltip: 'Subscript'
  },

  superscript: {
    exec: 'superscript',
    tooltip: 'Superscript'
  },

  left: {
    state: function (node) {
      if (node && node.nodeType === 3) {
        node = node.parentNode;
      }

      if (node) {
        var isLtr = css(node, 'direction') === 'ltr';
        var align = css(node, 'textAlign');

        return /left/.test(align) ||
          align === (isLtr ? 'start' : 'end');
      }
    },
    exec: 'justifyleft',
    tooltip: 'Align left'
  },

  center: {
    exec: 'justifycenter',
    tooltip: 'Center'
  },

  right: {
    state: function (node) {
      if (node && node.nodeType === 3) {
        node = node.parentNode;
      }

      if (node) {
        var isLtr = css(node, 'direction') === 'ltr';
        var align = css(node, 'textAlign');

        return /right/.test(align) ||
          align === (isLtr ? 'end' : 'start');
      }
    },
    exec: 'justifyright',
    tooltip: 'Align right'
  },

  justify: {
    exec: 'justifyfull',
    tooltip: 'Justify'
  },

  header: {
    _dropDown: function (editor, caller, callback) {
      var	content = createElement('div');

      on(content, 'click', 'a', function (e) {
        callback(data(this, 'size'));
        editor.closeDropDown(true);
        e.preventDefault();
      });

      var vLevel = "";
      var vSep = "";
      for (var i = 2; i <= 6; i++) {
        vLevel += vSep + (i-1);
        vSep = ".";
        appendChild(content, _tmpl('headerOpt', {
          level: vLevel + " Section",
          size: 8-i
        }, true));
      }
      appendChild(content, _tmpl('normalOpt', {
        level: "normal",
        size: 0
      }, true));

      editor.createDropDown(caller, 'headersize-picker', content);
    },
    exec: function (caller) {
      var editor = this;

      defaultCmds.header._dropDown(editor, caller, function (pSize) {
        
        var headerSize = 7-pSize;
        console.log("sceditor.js:2258 - headerSize="+headerSize+" pSize="+pSize);
        
        if ((pSize*1) > 0) {
          editor.execCommand('formatBlock','div');
          editor.wysiwygEditorInsertHtml(
                '<h' + headerSize + '>',
                '</h' + headerSize + '>'
            );
        } else {
          console.log("sceditor.js:2273 - clean tags");
          editor.execCommand('formatBlock','div')
          
        }

      });
    },
    tooltip: 'Header Size'
  },

  font: {
    _dropDown: function (editor, caller, callback) {
      var	content = createElement('div');

      on(content, 'click', 'a', function (e) {
        callback(data(this, 'font'));
        editor.closeDropDown(true);
        e.preventDefault();
      });

      editor.opts.fonts.split(',').forEach(function (font) {
        appendChild(content, _tmpl('fontOpt', {
          font: font
        }, true));
      });

      editor.createDropDown(caller, 'font-picker', content);
    },
    exec: function (caller) {
      var editor = this;

      defaultCmds.font._dropDown(editor, caller, function (fontName) {
        editor.execCommand('fontname', fontName);
      });
    },
    tooltip: 'Font Name'
  },

  size: {
    _dropDown: function (editor, caller, callback) {
      var	content = createElement('div');

      on(content, 'click', 'a', function (e) {
        callback(data(this, 'size'));
        editor.closeDropDown(true);
        e.preventDefault();
      });

      for (var i = 1; i <= 7; i++) {
        appendChild(content, _tmpl('sizeOpt', {
          size: i
        }, true));
      }

      editor.createDropDown(caller, 'fontsize-picker', content);
    },
    exec: function (caller) {
      var editor = this;

      defaultCmds.size._dropDown(editor, caller, function (fontSize) {
        editor.execCommand('fontsize', fontSize);
      });
    },
    tooltip: 'Font Size'
  },

  color: {
    _dropDown: function (editor, caller, callback) {
      var	content = createElement('div'),
        html    = '',
        cmd     = defaultCmds.color;

      if (!cmd._htmlCache) {
        editor.opts.colors.split('|').forEach(function (column) {
          html += '<div class="sceditor-color-column">';

          column.split(',').forEach(function (color) {
            html +=
              '<a href="#" class="sceditor-color-option"' +
              ' style="background-color: ' + color + '"' +
              ' data-color="' + color + '"></a>';
          });

          html += '</div>';
        });

        cmd._htmlCache = html;
      }

      appendChild(content, parseHTML(cmd._htmlCache));

      on(content, 'click', 'a', function (e) {
        callback(data(this, 'color'));
        editor.closeDropDown(true);
        e.preventDefault();
      });

      editor.createDropDown(caller, 'color-picker', content);
    },
    exec: function (caller) {
      var editor = this;

      defaultCmds.color._dropDown(editor, caller, function (color) {
        editor.execCommand('forecolor', color);
      });
    },
    tooltip: 'Font Color'
  },

  removeformat: {
    exec: 'removeformat',
    tooltip: 'Remove Formatting'
  },

  cut: {
    exec: 'cut',
    tooltip: 'Cut',
    errorMessage: 'Your browser does not allow the cut command. ' +
      'Please use the keyboard shortcut Ctrl/Cmd-X'
  },

  copy: {
    exec: 'copy',
    tooltip: 'Copy',
    errorMessage: 'Your browser does not allow the copy command. ' +
      'Please use the keyboard shortcut Ctrl/Cmd-C'
  },

  paste: {
    exec: 'paste',
    tooltip: 'Paste',
    errorMessage: 'Your browser does not allow the paste command. ' +
      'Please use the keyboard shortcut Ctrl/Cmd-V'
  },

  pastetext: {
    exec: function (caller) {
      var	val,
        content = createElement('div'),
        editor  = this;

      appendChild(content, _tmpl('pastetext', {
        label: editor._(
          'Paste your text inside the following box:'
        ),
        insert: editor._('Insert')
      }, true));

      on(content, 'click', '.button', function (e) {
        val = find(content, '#txt')[0].value;

        if (val) {
          editor.wysiwygEditorInsertText(val);
        }

        editor.closeDropDown(true);
        e.preventDefault();
      });

      editor.createDropDown(caller, 'pastetext', content);
    },
    tooltip: 'Paste Text'
  },

  bulletlist: {
    exec: function () {
      fixFirefoxListBug(this);
      this.execCommand('insertunorderedlist');
    },
    tooltip: 'Bullet list'
  },

  orderedlist: {
    exec: function () {
      fixFirefoxListBug(this);
      this.execCommand('insertorderedlist');
    },
    tooltip: 'Numbered list'
  },

  indent: {
    state: function (parent, firstBlock) {
      
      var	range, startParent, endParent;

      if (is(firstBlock, 'li')) {
        return 0;
      }

      if (is(firstBlock, 'ul,ol,menu')) {

        range = this.getRangeHelper().selectedRange();

        startParent = range.startContainer.parentNode;
        endParent   = range.endContainer.parentNode;

        if (startParent !==
          startParent.parentNode.firstElementChild ||
          
          (is(endParent, 'li') && endParent !==
            endParent.parentNode.lastElementChild)) {
          return 0;
        }
      }

      return -1;
    },
    exec: function () {
      var editor = this,
        block = editor.getRangeHelper().getFirstBlockParent();

      editor.focus();

      if (closest(block, 'ul,ol,menu')) {
        editor.execCommand('indent');
      }
    },
    tooltip: 'Add indent'
  },

  outdent: {
    state: function (parents, firstBlock) {
      return closest(firstBlock, 'ul,ol,menu') ? 0 : -1;
    },
    exec: function () {
      var	block = this.getRangeHelper().getFirstBlockParent();
      if (closest(block, 'ul,ol,menu')) {
        this.execCommand('outdent');
      }
    },
    tooltip: 'Remove one indent'
  },

  table: {
    exec: function (caller) {
      var	editor  = this,
        content = createElement('div');

      appendChild(content, _tmpl('table', {
        rows: editor._('Rows:'),
        cols: editor._('Cols:'),
        insert: editor._('Insert')
      }, true));

      on(content, 'click', '.button', function (e) {
        var	rows = Number(find(content, '#rows')[0].value),
          cols = Number(find(content, '#cols')[0].value),
          html = '<table>';

        if (rows > 0 && cols > 0) {
          html += Array(rows + 1).join(
            '<tr>' +
              Array(cols + 1).join(
                '<td><br /></td>'
              ) +
            '</tr>'
          );

          html += '</table>';

          editor.wysiwygEditorInsertHtml(html);
          editor.closeDropDown(true);
          e.preventDefault();
        }
      });

      editor.createDropDown(caller, 'inserttable', content);
    },
    tooltip: 'Insert a table'
  },

  horizontalrule: {
    exec: 'inserthorizontalrule',
    tooltip: 'Insert a horizontal rule'
  },

  code: {
    exec: function () {
      this.wysiwygEditorInsertHtml(
        '<code>',
        '<br /></code>'
      );
    },
    tooltip: 'Code'
  },

  image: {
    _dropDown: function (editor, caller, selected, cb) {
      var	content = createElement('div');

      appendChild(content, _tmpl('image', {
        url: editor._('URL:'),
        width: editor._('Width (optional):'),
        height: editor._('Height (optional):'),
        insert: editor._('Insert')
      }, true));

      var	urlInput = find(content, '#image')[0];

      urlInput.value = selected;

      on(content, 'click', '.button', function (e) {
        if (urlInput.value) {
          cb(
            urlInput.value,
            find(content, '#width')[0].value,
            find(content, '#height')[0].value
          );
        }

        editor.closeDropDown(true);
        e.preventDefault();
      });

      editor.createDropDown(caller, 'insertimage', content);
    },
    exec: function (caller) {
      var	editor  = this;

      defaultCmds.image._dropDown(
        editor,
        caller,
        '',
        function (url, width, height) {
          var attrs  = '';

          if (width) {
            attrs += ' width="' + parseInt(width, 10) + '"';
          }

          if (height) {
            attrs += ' height="' + parseInt(height, 10) + '"';
          }

          attrs += ' src="' + entities(url) + '"';

          editor.wysiwygEditorInsertHtml(
            '<img' + attrs + ' />'
          );
        }
      );
    },
    tooltip: 'Insert an image'
  },

  email: {
    _dropDown: function (editor, caller, cb) {
      var	content = createElement('div');

      appendChild(content, _tmpl('email', {
        label: editor._('E-mail:'),
        desc: editor._('Description (optional):'),
        insert: editor._('Insert')
      }, true));

      on(content, 'click', '.button', function (e) {
        var email = find(content, '#email')[0].value;

        if (email) {
          cb(email, find(content, '#des')[0].value);
        }

        editor.closeDropDown(true);
        e.preventDefault();
      });

      editor.createDropDown(caller, 'insertemail', content);
    },
    exec: function (caller) {
      var	editor  = this;

      defaultCmds.email._dropDown(
        editor,
        caller,
        function (email, text) {
          if (!editor.getRangeHelper().selectedHtml() || text) {
            editor.wysiwygEditorInsertHtml(
              '<a href="' +
              'mailto:' + entities(email) + '">' +
                entities((text || email)) +
              '</a>'
            );
          } else {
            editor.execCommand('createlink', 'mailto:' + email);
          }
        }
      );
    },
    tooltip: 'Insert an email'
  },

  link: {
    _dropDown: function (editor, caller, cb) {
      var content = createElement('div');

      appendChild(content, _tmpl('link', {
        url: editor._('URL:'),
        desc: editor._('Description (optional):'),
        ins: editor._('Insert')
      }, true));

      var linkInput = find(content, '#link')[0];

      function insertUrl(e) {
        if (linkInput.value) {
          cb(linkInput.value, find(content, '#des')[0].value);
        }

        editor.closeDropDown(true);
        e.preventDefault();
      }

      on(content, 'click', '.button', insertUrl);
      on(content, 'keypress', function (e) {
        
        if (e.which === 13 && linkInput.value) {
          insertUrl(e);
        }
      }, EVENT_CAPTURE);

      editor.createDropDown(caller, 'inserDropDowntlink', content);
    },
    exec: function (caller) {
      var editor = this;

      defaultCmds.link._dropDown(editor, caller, function (url, text) {
        if (text || !editor.getRangeHelper().selectedHtml()) {
          editor.wysiwygEditorInsertHtml(
            '<a href="' + entities(url) + '">' +
              entities(text || url) +
            '</a>'
          );
        } else {
          editor.execCommand('createlink', url);
        }
      });
    },
    tooltip: 'Insert a link'
  },

  unlink: {
    state: function () {
      return closest(this.currentNode(), 'a') ? 0 : -1;
    },
    exec: function () {
      var anchor = closest(this.currentNode(), 'a');

      if (anchor) {
        while (anchor.firstChild) {
          insertBefore(anchor.firstChild, anchor);
        }

        remove(anchor);
      }
    },
    tooltip: 'Unlink'
  },

  quote: {
    exec: function (caller, html, author) {
      var	before = '<blockquote>',
        end    = '</blockquote>';

      if (html) {
        author = (author ? '<cite>' +
          entities(author) +
        '</cite>' : '');
        before = before + author + html + end;
        end    = null;
      
      } else if (this.getRangeHelper().selectedHtml() === '') {
        end = '<br />' + end;
      }

      this.wysiwygEditorInsertHtml(before, end);
    },
    tooltip: 'Insert a Quote'
  },

  ref: {
    exec: function (caller, html, reference,refname) {
      var	before = '<ref>',
        end    = '</ref>';

      if (html) {

        if (reference) {

        }
        reference = (reference ? '<ref>' +
          json2reference(reference) +
        '</cite>' : '');
        before = before + author + html + end;
        end    = null;
      
      } else if (this.getRangeHelper().selectedHtml() === '') {
        end = '<br />' + end;
      }

      this.wysiwygEditorInsertHtml(before, end);
    },
    tooltip: 'Insert a Quote'
  },

  emoticon: {
    exec: function (caller) {
      var editor = this;

      var createContent = function (includeMore) {
        var	moreLink,
          opts            = editor.opts,
          emoticonsRoot   = opts.emoticonsRoot || '',
          emoticonsCompat = opts.emoticonsCompat,
          rangeHelper     = editor.getRangeHelper(),
          startSpace      = emoticonsCompat &&
            rangeHelper.getOuterText(true, 1) !== ' ' ? ' ' : '',
          endSpace        = emoticonsCompat &&
            rangeHelper.getOuterText(false, 1) !== ' ' ? ' ' : '',
          content         = createElement('div'),
          line            = createElement('div'),
          perLine         = 0,
          emoticons       = extend(
            {},
            opts.emoticons.dropdown,
            includeMore ? opts.emoticons.more : {}
          );

        appendChild(content, line);

        perLine = Math.sqrt(Object.keys(emoticons).length);

        on(content, 'click', 'img', function (e) {
          editor.insert(startSpace + attr(this, 'alt') + endSpace,
            null, false).closeDropDown(true);

          e.preventDefault();
        });

        each(emoticons, function (code, emoticon) {
          appendChild(line, createElement('img', {
            src: emoticonsRoot + (emoticon.url || emoticon),
            alt: code,
            name: emoticon.tooltip || code
          }));

          if (line.children.length >= perLine) {
            line = createElement('div');
            appendChild(content, line);
          }
        });

        if (!includeMore && opts.emoticons.more) {
          moreLink = createElement('a', {
            className: 'sceditor-more'
          });

          appendChild(moreLink,
            document.createTextNode(editor._('More')));

          on(moreLink, 'click', function (e) {
            editor.createDropDown(
              caller, 'more-emoticons', createContent(true)
            );

            e.preventDefault();
          });

          appendChild(content, moreLink);
        }

        return content;
      };

      editor.createDropDown(caller, 'emoticons', createContent(false));
    },
    txtExec: function (caller) {
      defaultCmds.emoticon.exec.call(this, caller);
    },
    tooltip: 'Insert an emoticon'
  },

  youtube: {
    _dropDown: function (editor, caller, callback) {
      var	content = createElement('div');

      appendChild(content, _tmpl('youtubeMenu', {
        label: editor._('Video URL:'),
        insert: editor._('Insert')
      }, true));

      on(content, 'click', '.button', function (e) {
        var val = find(content, '#link')[0].value;
        var idMatch = val.match(/(?:v=|v\/|embed\/|youtu.be\/)?([a-zA-Z0-9_-]{11})/);
        var timeMatch = val.match(/[&|?](?:star)?t=((\d+[hms]?){1,3})/);
        var time = 0;

        if (timeMatch) {
          each(timeMatch[1].split(/[hms]/), function (i, val) {
            if (val !== '') {
              time = (time * 60) + Number(val);
            }
          });
        }

        if (idMatch && /^[a-zA-Z0-9_\-]{11}$/.test(idMatch[1])) {
          callback(idMatch[1], time);
        }

        editor.closeDropDown(true);
        e.preventDefault();
      });

      editor.createDropDown(caller, 'insertlink', content);
    },
    exec: function (btn) {
      var editor = this;

      defaultCmds.youtube._dropDown(editor, btn, function (id, time) {
        editor.wysiwygEditorInsertHtml(_tmpl('youtube', {
          id: id,
          mathe: time
        }));
      });
    },
    tooltip: 'Insert a YouTube video'
  },

  mathexprXXX: {
    exec: function (btn) {
      var editor = this;
      editor.toggleMathMode();

    },
    tooltip: 'Insert a Mathematical Expression'
  },
  mathexpr: {
    _dropDown: function (editor, caller, callback) {
      var	content = createElement('div');

      appendChild(content, _tmpl('mathMenu', {
        label: editor._('Mathematical Expression:'),
        insert: editor._('Insert')
      }, true));

      on(content, 'click', '.button', function (e) {
        var mathid = find(content, '#mathsource')[0].value;
        var mathsource = editor.getLatex4MathCmds(mathid);
        var mathdisplay = find(content, '#mathdisplay')[0].value;
        alert("mathid='"+mathid+"' mathsource='"+mathsource+"' mathdisplay='"+mathdisplay+"'")
        console.log("sceditor.js:3434 mathsource='"+mathsource+"' mathdisplay='"+mathdisplay+"'")
        callback(get_unique_id(), mathsource, mathdisplay);

        editor.closeDropDown(true);
        e.preventDefault();
      });

      editor.createDropDown(caller, 'insertlink', content);
    },
    exec: function (btn) {
      var editor = this;

      defaultCmds.mathexpr._dropDown(editor, btn, function (id, mathsource, mathdisplay) {
        
        editor.wysiwygEditorInsertHtml(_tmpl('mathexpr', {
            id: id,
            mathsource: mathsource,
            mathdisplay: mathdisplay
        }));

        editor.openMathEditor(mathsource,mathdisplay,id);

      });
    },
    tooltip: 'Insert a Mathematical Expression'
  },

  date: {
    _date: function (editor) {
      var	now   = new Date(),
        year  = now.getYear(),
        month = now.getMonth() + 1,
        day   = now.getDate();

      if (year < 2000) {
        year = 1900 + year;
      }

      if (month < 10) {
        month = '0' + month;
      }

      if (day < 10) {
        day = '0' + day;
      }

      return editor.opts.dateFormat
        .replace(/year/i, year)
        .replace(/month/i, month)
        .replace(/day/i, day);
    },
    exec: function () {
      this.insertText(defaultCmds.date._date(this));
    },
    txtExec: function () {
      this.insertText(defaultCmds.date._date(this));
    },
    tooltip: 'Insert current date'
  },

  time: {
    _time: function () {
      var	now   = new Date(),
        hours = now.getHours(),
        mins  = now.getMinutes(),
        secs  = now.getSeconds();

      if (hours < 10) {
        hours = '0' + hours;
      }

      if (mins < 10) {
        mins = '0' + mins;
      }

      if (secs < 10) {
        secs = '0' + secs;
      }

      return hours + ':' + mins + ':' + secs;
    },
    exec: function () {
      this.insertText(defaultCmds.time._time());
    },
    txtExec: function () {
      this.insertText(defaultCmds.time._time());
    },
    tooltip: 'Insert current time'
  },

  ltr: {
    state: function (parents, firstBlock) {
      return firstBlock && firstBlock.style.direction === 'ltr';
    },
    exec: function () {
      var	editor = this,
        rangeHelper = editor.getRangeHelper(),
        node = rangeHelper.getFirstBlockParent();

      editor.focus();

      if (!node || is(node, 'body')) {
        editor.execCommand('formatBlock', 'p');

        node  = rangeHelper.getFirstBlockParent();

        if (!node || is(node, 'body')) {
          return;
        }
      }

      var toggleValue = css(node, 'direction') === 'ltr' ? '' : 'ltr';
      css(node, 'direction', toggleValue);
    },
    tooltip: 'Left-to-Right'
  },

  rtl: {
    state: function (parents, firstBlock) {
      return firstBlock && firstBlock.style.direction === 'rtl';
    },
    exec: function () {
      var	editor = this,
        rangeHelper = editor.getRangeHelper(),
        node = rangeHelper.getFirstBlockParent();

      editor.focus();

      if (!node || is(node, 'body')) {
        editor.execCommand('formatBlock', 'p');

        node = rangeHelper.getFirstBlockParent();

        if (!node || is(node, 'body')) {
          return;
        }
      }

      var toggleValue = css(node, 'direction') === 'rtl' ? '' : 'rtl';
      css(node, 'direction', toggleValue);
    },
    tooltip: 'Right-to-Left'
  },

  print: {
    exec: function () {
      var editor = this;
      
      var content;
      if (editor.inSourceMode()) {
        content = editor.getValue();
        alert("SOURCE: print code - "+content);
        
      } else {
        content = editor.getHTMLEditorValue();
        alert("HTML: Print Editor Content "+content);
        var newWin = window.open();
        newWin.document.write('<body onload="window.print()">'+content+'</body>');
        newWin.document.close();
      }

    },
    tooltip: 'Print'
  },

  maximize: {
    state: function () {
      return this.maximize();
    },
    exec: function () {
      this.maximize(!this.maximize());
      this.focus();
    },
    txtExec: function () {
      this.maximize(!this.maximize());
      this.focus();
    },
    tooltip: 'Maximize',
    shortcut: 'Ctrl+Shift+M'
  },

  source: {
    state: function () {
      return this.sourceMode();
    },
    exec: function () {
      this.toggleSourceMode();
      this.focus();
    },
    txtExec: function () {
      this.toggleSourceMode();
      this.focus();
    },
    tooltip: 'View source',
    shortcut: 'Ctrl+Shift+S'
  },

  ignore: {}
};

var plugins = {};

function PluginManager(thisObj) {
  
  var base = this;

  var registeredPlugins = [];

  var formatSignalName = function (signal) {
    return 'signal' + signal.charAt(0).toUpperCase() + signal.slice(1);
  };

  var callHandlers = function (args, returnAtFirst) {
    args = [].slice.call(args);

    var	idx, ret,
      signal = formatSignalName(args.shift());

    for (idx = 0; idx < registeredPlugins.length; idx++) {
      if (signal in registeredPlugins[idx]) {
        ret = registeredPlugins[idx][signal].apply(thisObj, args);

        if (returnAtFirst) {
          return ret;
        }
      }
    }
  };

  base.call = function () {
    callHandlers(arguments, false);
  };

  base.callOnlyFirst = function () {
    return callHandlers(arguments, true);
  };

  base.hasHandler = function (signal) {
    var i  = registeredPlugins.length;
    signal = formatSignalName(signal);

    while (i--) {
      if (signal in registeredPlugins[i]) {
        return true;
      }
    }

    return false;
  };

  base.exists = function (plugin) {
    if (plugin in plugins) {
      plugin = plugins[plugin];

      return typeof plugin === 'function' &&
        typeof plugin.prototype === 'object';
    }

    return false;
  };

  base.isRegistered = function (plugin) {
    if (base.exists(plugin)) {
      var idx = registeredPlugins.length;

      while (idx--) {
        if (registeredPlugins[idx] instanceof plugins[plugin]) {
          return true;
        }
      }
    }

    return false;
  };

  base.register = function (plugin) {
    if (!base.exists(plugin) || base.isRegistered(plugin)) {
      return false;
    }

    plugin = new plugins[plugin]();
    registeredPlugins.push(plugin);

    if ('init' in plugin) {
      plugin.init.call(thisObj);
    }

    return true;
  };

  base.deregister = function (plugin) {
    var	removedPlugin,
      pluginIdx = registeredPlugins.length,
      removed   = false;

    if (!base.isRegistered(plugin)) {
      return removed;
    }

    while (pluginIdx--) {
      if (registeredPlugins[pluginIdx] instanceof plugins[plugin]) {
        removedPlugin = registeredPlugins.splice(pluginIdx, 1)[0];
        removed       = true;

        if ('destroy' in removedPlugin) {
          removedPlugin.destroy.call(thisObj);
        }
      }
    }

    return removed;
  };

  base.destroy = function () {
    var i = registeredPlugins.length;

    while (i--) {
      if ('destroy' in registeredPlugins[i]) {
        registeredPlugins[i].destroy.call(thisObj);
      }
    }

    registeredPlugins = [];
    thisObj    = null;
  };
}

PluginManager.plugins = plugins;

var outerText = function (range, isLeft, length) {
  var nodeValue, remaining, start, end, node,
    text = '',
    next = range.startContainer,
    offset = range.startOffset;

  if (next && next.nodeType !== 3) {
    next = next.childNodes[offset];
    offset = 0;
  }

  start = end = offset;

  while (length > text.length && next && next.nodeType === 3) {
    nodeValue = next.nodeValue;
    remaining = length - text.length;

    if (node) {
      end = nodeValue.length;
      start = 0;
    }

    node = next;

    if (isLeft) {
      start = Math.max(end - remaining, 0);
      offset = start;

      text = nodeValue.substr(start, end - start) + text;
      next = node.previousSibling;
    } else {
      end = Math.min(remaining, nodeValue.length);
      offset = start + end;

      text += nodeValue.substr(start, end);
      next = node.nextSibling;
    }
  }

  return {
    node: node || next,
    offset: offset,
    text: text
  };
};

function RangeHelper(win, d, sanitize) {
  var	_createMarker, _prepareInput,
    doc          = d || win.contentDocument || win.document,
    startMarker  = 'sceditor-start-marker',
    endMarker    = 'sceditor-end-marker',
    base         = this;

  base.insertHTML = function (html, endHTML) {
    var	node, div,
      range = base.selectedRange();

    if (!range) {
      return false;
    }

    if (endHTML) {
      html += base.selectedHtml() + endHTML;
    }

    div           = createElement('p', {}, doc);
    node          = doc.createDocumentFragment();
    div.innerHTML = sanitize(html);

    while (div.firstChild) {
      appendChild(node, div.firstChild);
    }

    base.insertNode(node);
  };

  _prepareInput = function (node, endNode, returnHtml) {
    var lastChild,
      frag = doc.createDocumentFragment();

    if (typeof node === 'string') {
      if (endNode) {
        node += base.selectedHtml() + endNode;
      }

      frag = parseHTML(node);
    } else {
      appendChild(frag, node);

      if (endNode) {
        appendChild(frag, base.selectedRange().extractContents());
        appendChild(frag, endNode);
      }
    }

    if (!(lastChild = frag.lastChild)) {
      return;
    }

    while (!isInline(lastChild.lastChild, true)) {
      lastChild = lastChild.lastChild;
    }

    if (canHaveChildren(lastChild)) {

      if (!lastChild.lastChild) {
        appendChild(lastChild, document.createTextNode('\u200B'));
      }
    } else {
      lastChild = frag;
    }

    base.removeMarkers();

    appendChild(lastChild, _createMarker(startMarker));
    appendChild(lastChild, _createMarker(endMarker));

    if (returnHtml) {
      var div = createElement('div');
      appendChild(div, frag);

      return div.innerHTML;
    }

    return frag;
  };

  base.insertNode = function (node, endNode) {
    var	first, last,
      input  = _prepareInput(node, endNode),
      range  = base.selectedRange(),
      parent = range.commonAncestorContainer,
      emptyNodes = [];

    if (!input) {
      return false;
    }

    function removeIfEmpty(node) {
      
      if (node && isEmpty(node) && emptyNodes.indexOf(node) < 0) {
        remove(node);
      }
    }

    if (range.startContainer !== range.endContainer) {
      each(parent.childNodes, function (_, node) {
        if (isEmpty(node)) {
          emptyNodes.push(node);
        }
      });

      first = input.firstChild;
      last = input.lastChild;
    }

    range.deleteContents();

    if (parent && parent.nodeType !== 3 && !canHaveChildren(parent)) {
      insertBefore(input, parent);
    } else {
      range.insertNode(input);

      removeIfEmpty(first && first.previousSibling);
      removeIfEmpty(last && last.nextSibling);
    }

    base.restoreRange();
  };

  base.cloneSelected = function () {
    var range = base.selectedRange();

    if (range) {
      return range.cloneRange();
    }
  };

  base.selectedRange = function () {
    var	range, firstChild,
      sel = win.getSelection();

    if (!sel) {
      return;
    }

    if (sel.rangeCount <= 0) {
      firstChild = doc.body;
      while (firstChild.firstChild) {
        firstChild = firstChild.firstChild;
      }

      range = doc.createRange();

      range.setStartBefore(firstChild);

      sel.addRange(range);
    }

    if (sel.rangeCount > 0) {
      range = sel.getRangeAt(0);
    }

    return range;
  };

  base.hasSelection = function () {
    var	sel = win.getSelection();

    return sel && sel.rangeCount > 0;
  };

  base.selectedHtml = function () {
    var	div,
      range = base.selectedRange();

    if (range) {
      div = createElement('p', {}, doc);
      appendChild(div, range.cloneContents());

      return div.innerHTML;
    }

    return '';
  };

  base.parentNode = function () {
    var range = base.selectedRange();

    if (range) {
      return range.commonAncestorContainer;
    }
  };

  base.getFirstBlockParent = function (node) {
    var func = function (elm) {
      if (!isInline(elm, true)) {
        return elm;
      }

      elm = elm ? elm.parentNode : null;

      return elm ? func(elm) : elm;
    };

    return func(node || base.parentNode());
  };

  base.insertNodeAt = function (start, node) {
    var	currentRange = base.selectedRange(),
      range        = base.cloneSelected();

    if (!range) {
      return false;
    }

    range.collapse(start);
    range.insertNode(node);

    base.selectRange(currentRange);
  };

  _createMarker = function (id) {
    base.removeMarker(id);

    var marker  = createElement('span', {
      id: id,
      className: 'sceditor-selection sceditor-ignore',
      style: 'display:none;line-height:0'
    }, doc);

    marker.innerHTML = ' ';

    return marker;
  };

  base.insertMarkers = function () {
    var	currentRange = base.selectedRange();
    var startNode = _createMarker(startMarker);

    base.removeMarkers();
    base.insertNodeAt(true, startNode);

    if (currentRange && currentRange.collapsed) {
      startNode.parentNode.insertBefore(
        _createMarker(endMarker), startNode.nextSibling);
    } else {
      base.insertNodeAt(false, _createMarker(endMarker));
    }
  };

  base.getMarker = function (id) {
    return doc.getElementById(id);
  };

  base.removeMarker = function (id) {
    var marker = base.getMarker(id);

    if (marker) {
      remove(marker);
    }
  };

  base.removeMarkers = function () {
    base.removeMarker(startMarker);
    base.removeMarker(endMarker);
  };

  base.saveRange = function () {
    base.insertMarkers();
  };

  base.selectRange = function (range) {
    var lastChild;
    var sel = win.getSelection();
    var container = range.endContainer;

    if (range.collapsed && container &&
      !isInline(container, true)) {

      lastChild = container.lastChild;
      while (lastChild && is(lastChild, '.sceditor-ignore')) {
        lastChild = lastChild.previousSibling;
      }

      if (is(lastChild, 'br')) {
        var rng = doc.createRange();
        rng.setEndAfter(lastChild);
        rng.collapse(false);

        if (base.compare(range, rng)) {
          range.setStartBefore(lastChild);
          range.collapse(true);
        }
      }
    }

    if (sel) {
      base.clear();
      sel.addRange(range);
    }
  };

  base.restoreRange = function () {
    var	isCollapsed,
      range = base.selectedRange(),
      start = base.getMarker(startMarker),
      end   = base.getMarker(endMarker);

    if (!start || !end || !range) {
      return false;
    }

    isCollapsed = start.nextSibling === end;

    range = doc.createRange();
    range.setStartBefore(start);
    range.setEndAfter(end);

    if (isCollapsed) {
      range.collapse(true);
    }

    base.selectRange(range);
    base.removeMarkers();
  };

  base.selectOuterText = function (left, right) {
    var start, end,
      range = base.cloneSelected();

    if (!range) {
      return false;
    }

    range.collapse(false);

    start = outerText(range, true, left);
    end = outerText(range, false, right);

    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);

    base.selectRange(range);
  };

  base.getOuterText = function (before, length) {
    var	range = base.cloneSelected();

    if (!range) {
      return '';
    }

    range.collapse(!before);

    return outerText(range, before, length).text;
  };

  base.replaceKeyword = function (
    keywords,
    includeAfter,
    keywordsSorted,
    longestKeyword,
    requireWhitespace,
    keypressChar
  ) {
    if (!keywordsSorted) {
      keywords.sort(function (a, b) {
        return a[0].length - b[0].length;
      });
    }

    var outerText, match, matchPos, startIndex,
      leftLen, charsLeft, keyword, keywordLen,
      whitespaceRegex = '(^|[\\s\xA0\u2002\u2003\u2009])',
      keywordIdx      = keywords.length,
      whitespaceLen   = requireWhitespace ? 1 : 0,
      maxKeyLen       = longestKeyword ||
        keywords[keywordIdx - 1][0].length;

    if (requireWhitespace) {
      maxKeyLen++;
    }

    keypressChar = keypressChar || '';
    outerText    = base.getOuterText(true, maxKeyLen);
    leftLen      = outerText.length;
    outerText   += keypressChar;

    if (includeAfter) {
      outerText += base.getOuterText(false, maxKeyLen);
    }

    while (keywordIdx--) {
      keyword    = keywords[keywordIdx][0];
      keywordLen = keyword.length;
      startIndex = Math.max(0, leftLen - keywordLen - whitespaceLen);
      matchPos   = -1;

      if (requireWhitespace) {
        match = outerText
          .substr(startIndex)
          .match(new RegExp(whitespaceRegex +
            regex(keyword) + whitespaceRegex));

        if (match) {

          matchPos = match.index + startIndex + match[1].length;
        }
      } else {
        matchPos = outerText.indexOf(keyword, startIndex);
      }

      if (matchPos > -1) {

        if (matchPos <= leftLen &&
          matchPos + keywordLen + whitespaceLen >= leftLen) {
          charsLeft = leftLen - matchPos;

          base.selectOuterText(
            charsLeft,
            keywordLen - charsLeft -
              (/^\S/.test(keypressChar) ? 1 : 0)
          );

          base.insertHTML(keywords[keywordIdx][1]);
          return true;
        }
      }
    }

    return false;
  };

  base.compare = function (rngA, rngB) {
    if (!rngB) {
      rngB = base.selectedRange();
    }

    if (!rngA || !rngB) {
      return !rngA && !rngB;
    }

    return rngA.compareBoundaryPoints(Range.END_TO_END, rngB) === 0 &&
      rngA.compareBoundaryPoints(Range.START_TO_START, rngB) === 0;
  };

  base.clear = function () {
    var sel = win.getSelection();

    if (sel) {
      if (sel.removeAllRanges) {
        sel.removeAllRanges();
      } else if (sel.empty) {
        sel.empty();
      }
    }
  };
}

var USER_AGENT = navigator.userAgent;

var ios = /iPhone|iPod|iPad| wosbrowser\//i.test(USER_AGENT);

var isWysiwygSupported = (function () {
  var	match, isUnsupported;

  var ie = !!window.document.documentMode;
  var legacyEdge = '-ms-ime-align' in document.documentElement.style;

  var div = document.createElement('div');
  div.contentEditable = true;

  if (!('contentEditable' in document.documentElement) ||
    div.contentEditable !== 'true') {
    return false;
  }

  isUnsupported = /Opera Mobi|Opera Mini/i.test(USER_AGENT);

  if (/Android/i.test(USER_AGENT)) {
    isUnsupported = true;

    if (/Safari/.test(USER_AGENT)) {

      match = /Safari\/(\d+)/.exec(USER_AGENT);
      isUnsupported = (!match || !match[1] ? true : match[1] < 534);
    }
  }

  if (/ Silk\//i.test(USER_AGENT)) {
    match = /AppleWebKit\/(\d+)/.exec(USER_AGENT);
    isUnsupported = (!match || !match[1] ? true : match[1] < 534);
  }

  if (ios) {
    
    isUnsupported = /OS [0-4](_\d)+ like Mac/i.test(USER_AGENT);
  }

  if (/Firefox/i.test(USER_AGENT)) {
    isUnsupported = false;
  }

  if (/OneBrowser/i.test(USER_AGENT)) {
    isUnsupported = false;
  }

  if (navigator.vendor === 'UCWEB') {
    isUnsupported = false;
  }

  if (ie || legacyEdge) {
    isUnsupported = true;
  }

  return !isUnsupported;
}());

function checkWhitespace(node, rangeHelper) {
  var noneWsRegex = /[^\s\xA0\u2002\u2003\u2009]+/;
  var emoticons = node && find(node, 'img[data-sceditor-emoticon]');

  if (!node || !emoticons.length) {
    return;
  }

  for (var i = 0; i < emoticons.length; i++) {
    var emoticon = emoticons[i];
    var parent = emoticon.parentNode;
    var prev = emoticon.previousSibling;
    var next = emoticon.nextSibling;

    if ((!prev || !noneWsRegex.test(prev.nodeValue.slice(-1))) &&
      (!next || !noneWsRegex.test((next.nodeValue || '')[0]))) {
      continue;
    }

    var range = rangeHelper.cloneSelected();
    var rangeStart = -1;
    var rangeStartContainer = range.startContainer;
    var previousText = prev.nodeValue || '';

    previousText += data(emoticon, 'sceditor-emoticon');

    if (rangeStartContainer === next) {
      rangeStart = previousText.length + range.startOffset;
    }

    if (rangeStartContainer === node &&
      node.childNodes[range.startOffset] === next) {
      rangeStart = previousText.length;
    }

    if (rangeStartContainer === prev) {
      rangeStart = range.startOffset;
    }

    if (!next || next.nodeType !== TEXT_NODE) {
      next = parent.insertBefore(
        parent.ownerDocument.createTextNode(''), next
      );
    }

    next.insertData(0, previousText);
    remove(prev);
    remove(emoticon);

    if (rangeStart > -1) {
      range.setStart(next, rangeStart);
      range.collapse(true);
      rangeHelper.selectRange(range);
    }
  }
}

function replace(root, emoticons, emoticonsCompat) {
  var	doc           = root.ownerDocument;
  var space         = '(^|\\s|\xA0|\u2002|\u2003|\u2009|$)';
  var emoticonCodes = [];
  var emoticonRegex = {};

  if (parent(root, 'code')) {
    return;
  }

  each(emoticons, function (key) {
    emoticonRegex[key] = new RegExp(space + regex(key) + space);
    emoticonCodes.push(key);
  });

  emoticonCodes.sort(function (a, b) {
    return b.length - a.length;
  });

  (function convert(node) {
    node = node.firstChild;

    while (node) {
      
      if (node.nodeType === ELEMENT_NODE && !is(node, 'code')) {
        convert(node);
      }

      if (node.nodeType === TEXT_NODE) {
        for (var i = 0; i < emoticonCodes.length; i++) {
          var text  = node.nodeValue;
          var key   = emoticonCodes[i];
          var index = emoticonsCompat ?
            text.search(emoticonRegex[key]) :
            text.indexOf(key);

          if (index > -1) {

            var startIndex = text.indexOf(key, index);
            var fragment   = parseHTML(emoticons[key], doc);
            var after      = text.substr(startIndex + key.length);

            fragment.appendChild(doc.createTextNode(after));

            node.nodeValue = text.substr(0, startIndex);
            node.parentNode
              .insertBefore(fragment, node.nextSibling);
          }
        }
      }

      node = node.nextSibling;
    }
  }(root));
}

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var hasOwnProperty = Object.hasOwnProperty,
    setPrototypeOf = Object.setPrototypeOf,
    isFrozen = Object.isFrozen,
    getPrototypeOf = Object.getPrototypeOf,
    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var freeze = Object.freeze,
    seal = Object.seal,
    create = Object.create; 

var _ref = typeof Reflect !== 'undefined' && Reflect,
    apply = _ref.apply,
    construct = _ref.construct;

if (!apply) {
  apply = function apply(fun, thisValue, args) {
    return fun.apply(thisValue, args);
  };
}

if (!freeze) {
  freeze = function freeze(x) {
    return x;
  };
}

if (!seal) {
  seal = function seal(x) {
    return x;
  };
}

if (!construct) {
  construct = function construct(Func, args) {
    return new (Function.prototype.bind.apply(Func, [null].concat(_toConsumableArray(args))))();
  };
}

var arrayForEach = unapply(Array.prototype.forEach);
var arrayPop = unapply(Array.prototype.pop);
var arrayPush = unapply(Array.prototype.push);

var stringToLowerCase = unapply(String.prototype.toLowerCase);
var stringMatch = unapply(String.prototype.match);
var stringReplace = unapply(String.prototype.replace);
var stringIndexOf = unapply(String.prototype.indexOf);
var stringTrim = unapply(String.prototype.trim);

var regExpTest = unapply(RegExp.prototype.test);

var typeErrorCreate = unconstruct(TypeError);

function unapply(func) {
  return function (thisArg) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return apply(func, thisArg, args);
  };
}

function unconstruct(func) {
  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return construct(func, args);
  };
}

function addToSet(set, array) {
  if (setPrototypeOf) {

    setPrototypeOf(set, null);
  }

  var l = array.length;
  while (l--) {
    var element = array[l];
    if (typeof element === 'string') {
      var lcElement = stringToLowerCase(element);
      if (lcElement !== element) {
        
        if (!isFrozen(array)) {
          array[l] = lcElement;
        }

        element = lcElement;
      }
    }

    set[element] = true;
  }

  return set;
}

function clone(object) {
  var newObject = create(null);

  var property = void 0;
  for (property in object) {
    if (apply(hasOwnProperty, object, [property])) {
      newObject[property] = object[property];
    }
  }

  return newObject;
}

function lookupGetter(object, prop) {
  while (object !== null) {
    var desc = getOwnPropertyDescriptor(object, prop);
    if (desc) {
      if (desc.get) {
        return unapply(desc.get);
      }

      if (typeof desc.value === 'function') {
        return unapply(desc.value);
      }
    }

    object = getPrototypeOf(object);
  }

  return null;
}

	var html = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);

	var svg = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'name', 'tref', 'tspan', 'view', 'vkern']);

	var svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']);

	var svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'fedropshadow', 'feimage', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);

	var mathMl = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover']);

	var mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);

	var text = freeze(['#text']);

	var html$1 = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'name', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns']);

	var svg$1 = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'targetx', 'targety', 'transform', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);

	var mathMl$1 = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);

	var xml = freeze(['xlink:href', 'xml:id', 'xlink:name', 'xml:space', 'xmlns:xlink']);

	var MUSTACHE_EXPR = seal(/\{\{[\s\S]*|[\s\S]*\}\}/gm); 
	var ERB_EXPR = seal(/<%[\s\S]*|[\s\S]*%>/gm);
	var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); 
	var ARIA_ATTR = seal(/^aria-[\-\w]+$/); 
	var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i 
	);
	var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
	var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g 
	);

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	var getGlobal = function getGlobal() {
	  return typeof window === 'undefined' ? null : window;
	};

	var _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, document) {
	  if ((typeof trustedTypes === 'undefined' ? 'undefined' : _typeof(trustedTypes)) !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
	    return null;
	  }

	  var suffix = null;
	  var ATTR_NAME = 'data-tt-policy-suffix';
	  if (document.currentScript && document.currentScript.hasAttribute(ATTR_NAME)) {
	    suffix = document.currentScript.getAttribute(ATTR_NAME);
	  }

	  var policyName = 'dompurify' + (suffix ? '#' + suffix : '');

	  try {
	    return trustedTypes.createPolicy(policyName, {
	      createHTML: function createHTML(html$$1) {
	        return html$$1;
	      }
	    });
	  } catch (_) {

	    console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
	    return null;
	  }
	};

	function createDOMPurify() {
	  var window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();

	  var DOMPurify = function DOMPurify(root) {
	    return createDOMPurify(root);
	  };

	  DOMPurify.version = '2.2.6';

	  DOMPurify.removed = [];

	  if (!window || !window.document || window.document.nodeType !== 9) {

	    DOMPurify.isSupported = false;

	    return DOMPurify;
	  }

	  var originalDocument = window.document;

	  var document = window.document;
	  var DocumentFragment = window.DocumentFragment,
	      HTMLTemplateElement = window.HTMLTemplateElement,
	      Node = window.Node,
	      Element = window.Element,
	      NodeFilter = window.NodeFilter,
	      _window$NamedNodeMap = window.NamedNodeMap,
	      NamedNodeMap = _window$NamedNodeMap === undefined ? window.NamedNodeMap || window.MozNamedAttrMap : _window$NamedNodeMap,
	      Text = window.Text,
	      Comment = window.Comment,
	      DOMParser = window.DOMParser,
	      trustedTypes = window.trustedTypes;

	  var ElementPrototype = Element.prototype;

	  var cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
	  var getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
	  var getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
	  var getParentNode = lookupGetter(ElementPrototype, 'parentNode');

	  if (typeof HTMLTemplateElement === 'function') {
	    var template = document.createElement('template');
	    if (template.content && template.content.ownerDocument) {
	      document = template.content.ownerDocument;
	    }
	  }

	  var trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, originalDocument);
	  var emptyHTML = trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML('') : '';

	  var _document = document,
	      implementation = _document.implementation,
	      createNodeIterator = _document.createNodeIterator,
	      getElementsByTagName = _document.getElementsByTagName,
	      createDocumentFragment = _document.createDocumentFragment;
	  var importNode = originalDocument.importNode;

	  var documentMode = {};
	  try {
	    documentMode = clone(document).documentMode ? document.documentMode : {};
	  } catch (_) {}

	  var hooks = {};

	  DOMPurify.isSupported = implementation && typeof implementation.createHTMLDocument !== 'undefined' && documentMode !== 9;

	  var MUSTACHE_EXPR$$1 = MUSTACHE_EXPR,
	      ERB_EXPR$$1 = ERB_EXPR,
	      DATA_ATTR$$1 = DATA_ATTR,
	      ARIA_ATTR$$1 = ARIA_ATTR,
	      IS_SCRIPT_OR_DATA$$1 = IS_SCRIPT_OR_DATA,
	      ATTR_WHITESPACE$$1 = ATTR_WHITESPACE;
	  var IS_ALLOWED_URI$$1 = IS_ALLOWED_URI;

	  var ALLOWED_TAGS = null;
	  var DEFAULT_ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray$1(html), _toConsumableArray$1(svg), _toConsumableArray$1(svgFilters), _toConsumableArray$1(mathMl), _toConsumableArray$1(text)));

	  var ALLOWED_ATTR = null;
	  var DEFAULT_ALLOWED_ATTR = addToSet({}, [].concat(_toConsumableArray$1(html$1), _toConsumableArray$1(svg$1), _toConsumableArray$1(mathMl$1), _toConsumableArray$1(xml)));

	  var FORBID_TAGS = null;

	  var FORBID_ATTR = null;

	  var ALLOW_ARIA_ATTR = true;

	  var ALLOW_DATA_ATTR = true;

	  var ALLOW_UNKNOWN_PROTOCOLS = false;

	  var SAFE_FOR_TEMPLATES = false;

	  var WHOLE_DOCUMENT = false;

	  var SET_CONFIG = false;

	  var FORCE_BODY = false;

	  var RETURN_DOM = false;

	  var RETURN_DOM_FRAGMENT = false;

	  var RETURN_DOM_IMPORT = true;

	  var RETURN_TRUSTED_TYPE = false;

	  var SANITIZE_DOM = true;

	  var KEEP_CONTENT = true;

	  var IN_PLACE = false;

	  var USE_PROFILES = {};

	  var FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'name', 'video', 'xmp']);

	  var DATA_URI_TAGS = null;
	  var DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);

	  var URI_SAFE_ATTRIBUTES = null;
	  var DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'summary', 'name', 'value', 'style', 'xmlns']);

	  var CONFIG = null;

	  var formElement = document.createElement('form');

	  var _parseConfig = function _parseConfig(cfg) {
	    if (CONFIG && CONFIG === cfg) {
	      return;
	    }

	    if (!cfg || (typeof cfg === 'undefined' ? 'undefined' : _typeof(cfg)) !== 'object') {
	      cfg = {};
	    }

	    cfg = clone(cfg);

	    ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS) : DEFAULT_ALLOWED_TAGS;
	    ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR) : DEFAULT_ALLOWED_ATTR;
	    URI_SAFE_ATTRIBUTES = 'ADD_URI_SAFE_ATTR' in cfg ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), cfg.ADD_URI_SAFE_ATTR) : DEFAULT_URI_SAFE_ATTRIBUTES;
	    DATA_URI_TAGS = 'ADD_DATA_URI_TAGS' in cfg ? addToSet(clone(DEFAULT_DATA_URI_TAGS), cfg.ADD_DATA_URI_TAGS) : DEFAULT_DATA_URI_TAGS;
	    FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS) : {};
	    FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR) : {};
	    USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
	    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; 
	    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; 
	    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; 
	    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; 
	    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; 
	    RETURN_DOM = cfg.RETURN_DOM || false; 
	    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; 
	    RETURN_DOM_IMPORT = cfg.RETURN_DOM_IMPORT !== false; 
	    RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; 
	    FORCE_BODY = cfg.FORCE_BODY || false; 
	    SANITIZE_DOM = cfg.SANITIZE_DOM !== false; 
	    KEEP_CONTENT = cfg.KEEP_CONTENT !== false; 
	    IN_PLACE = cfg.IN_PLACE || false; 
	    IS_ALLOWED_URI$$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI$$1;
	    if (SAFE_FOR_TEMPLATES) {
	      ALLOW_DATA_ATTR = false;
	    }

	    if (RETURN_DOM_FRAGMENT) {
	      RETURN_DOM = true;
	    }

	    if (USE_PROFILES) {
	      ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray$1(text)));
	      ALLOWED_ATTR = [];
	      if (USE_PROFILES.html === true) {
	        addToSet(ALLOWED_TAGS, html);
	        addToSet(ALLOWED_ATTR, html$1);
	      }

	      if (USE_PROFILES.svg === true) {
	        addToSet(ALLOWED_TAGS, svg);
	        addToSet(ALLOWED_ATTR, svg$1);
	        addToSet(ALLOWED_ATTR, xml);
	      }

	      if (USE_PROFILES.svgFilters === true) {
	        addToSet(ALLOWED_TAGS, svgFilters);
	        addToSet(ALLOWED_ATTR, svg$1);
	        addToSet(ALLOWED_ATTR, xml);
	      }

	      if (USE_PROFILES.mathMl === true) {
	        addToSet(ALLOWED_TAGS, mathMl);
	        addToSet(ALLOWED_ATTR, mathMl$1);
	        addToSet(ALLOWED_ATTR, xml);
	      }
	    }

	    if (cfg.ADD_TAGS) {
	      if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
	        ALLOWED_TAGS = clone(ALLOWED_TAGS);
	      }

	      addToSet(ALLOWED_TAGS, cfg.ADD_TAGS);
	    }

	    if (cfg.ADD_ATTR) {
	      if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
	        ALLOWED_ATTR = clone(ALLOWED_ATTR);
	      }

	      addToSet(ALLOWED_ATTR, cfg.ADD_ATTR);
	    }

	    if (cfg.ADD_URI_SAFE_ATTR) {
	      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR);
	    }

	    if (KEEP_CONTENT) {
	      ALLOWED_TAGS['#text'] = true;
	    }

	    if (WHOLE_DOCUMENT) {
	      addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
	    }

	    if (ALLOWED_TAGS.table) {
	      addToSet(ALLOWED_TAGS, ['tbody']);
	      delete FORBID_TAGS.tbody;
	    }

	    if (freeze) {
	      freeze(cfg);
	    }

	    CONFIG = cfg;
	  };

	  var MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext']);

	  var HTML_INTEGRATION_POINTS = addToSet({}, ['foreignobject', 'desc', 'name', 'annotation-xml']);

	  var ALL_SVG_TAGS = addToSet({}, svg);
	  addToSet(ALL_SVG_TAGS, svgFilters);
	  addToSet(ALL_SVG_TAGS, svgDisallowed);

	  var ALL_MATHML_TAGS = addToSet({}, mathMl);
	  addToSet(ALL_MATHML_TAGS, mathMlDisallowed);

	  var MATHML_NAMESPACE = 'http:/'+ '/www.w3.org/1998/Math/MathML';
	  var SVG_NAMESPACE = 'http:/'+ '/www.w3.org/2000/svg';
	  var HTML_NAMESPACE = 'http:/'+ '/www.w3.org/1999/xhtml';

	  var _checkValidNamespace = function _checkValidNamespace(element) {
	    var parent = getParentNode(element);

	    if (!parent || !parent.tagName) {
	      parent = {
	        namespaceURI: HTML_NAMESPACE,
	        tagName: 'template'
	      };
	    }

	    var tagName = stringToLowerCase(element.tagName);
	    var parentTagName = stringToLowerCase(parent.tagName);

	    if (element.namespaceURI === SVG_NAMESPACE) {

	      if (parent.namespaceURI === HTML_NAMESPACE) {
	        return tagName === 'svg';
	      }

	      if (parent.namespaceURI === MATHML_NAMESPACE) {
	        return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
	      }

	      return Boolean(ALL_SVG_TAGS[tagName]);
	    }

	    if (element.namespaceURI === MATHML_NAMESPACE) {

	      if (parent.namespaceURI === HTML_NAMESPACE) {
	        return tagName === 'math';
	      }

	      if (parent.namespaceURI === SVG_NAMESPACE) {
	        return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
	      }

	      return Boolean(ALL_MATHML_TAGS[tagName]);
	    }

	    if (element.namespaceURI === HTML_NAMESPACE) {

	      if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
	        return false;
	      }

	      if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
	        return false;
	      }

	      var commonSvgAndHTMLElements = addToSet({}, ['name', 'style', 'font', 'a', 'script']);

	      return !ALL_MATHML_TAGS[tagName] && (commonSvgAndHTMLElements[tagName] || !ALL_SVG_TAGS[tagName]);
	    }

	    return false;
	  };

	  var _forceRemove = function _forceRemove(node) {
	    arrayPush(DOMPurify.removed, { element: node });
	    try {
	      node.parentNode.removeChild(node);
	    } catch (_) {
	      try {
	        node.outerHTML = emptyHTML;
	      } catch (_) {
	        node.remove();
	      }
	    }
	  };

	  var _removeAttribute = function _removeAttribute(name, node) {
	    try {
	      arrayPush(DOMPurify.removed, {
	        attribute: node.getAttributeNode(name),
	        from: node
	      });
	    } catch (_) {
	      arrayPush(DOMPurify.removed, {
	        attribute: null,
	        from: node
	      });
	    }

	    node.removeAttribute(name);
	  };

	  var _initDocument = function _initDocument(dirty) {
	    
	    var doc = void 0;
	    var leadingWhitespace = void 0;

	    if (FORCE_BODY) {
	      dirty = '<remove></remove>' + dirty;
	    } else {
	      
	      var matches = stringMatch(dirty, /^[\r\n\t ]+/);
	      leadingWhitespace = matches && matches[0];
	    }

	    var dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
	    
	    try {
	      doc = new DOMParser().parseFromString(dirtyPayload, 'text/html');
	    } catch (_) {}

	    if (!doc || !doc.documentElement) {
	      doc = implementation.createHTMLDocument('');
	      var _doc = doc,
	          body = _doc.body;

	      body.parentNode.removeChild(body.parentNode.firstElementChild);
	      body.outerHTML = dirtyPayload;
	    }

	    if (dirty && leadingWhitespace) {
	      doc.body.insertBefore(document.createTextNode(leadingWhitespace), doc.body.childNodes[0] || null);
	    }

	    return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
	  };

	  var _createIterator = function _createIterator(root) {
	    return createNodeIterator.call(root.ownerDocument || root, root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, function () {
	      return NodeFilter.FILTER_ACCEPT;
	    }, false);
	  };

	  var _isClobbered = function _isClobbered(elm) {
	    if (elm instanceof Text || elm instanceof Comment) {
	      return false;
	    }

	    if (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function' || typeof elm.namespaceURI !== 'string' || typeof elm.insertBefore !== 'function') {
	      return true;
	    }

	    return false;
	  };

	  var _isNode = function _isNode(object) {
	    return (typeof Node === 'undefined' ? 'undefined' : _typeof(Node)) === 'object' ? object instanceof Node : object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string';
	  };

	  var _executeHook = function _executeHook(entryPoint, currentNode, data) {
	    if (!hooks[entryPoint]) {
	      return;
	    }

	    arrayForEach(hooks[entryPoint], function (hook) {
	      hook.call(DOMPurify, currentNode, data, CONFIG);
	    });
	  };

	  var _sanitizeElements = function _sanitizeElements(currentNode) {
	    var content = void 0;

	    _executeHook('beforeSanitizeElements', currentNode, null);

	    if (_isClobbered(currentNode)) {
	      _forceRemove(currentNode);
	      return true;
	    }

	    if (stringMatch(currentNode.nodeName, /[\u0080-\uFFFF]/)) {
	      _forceRemove(currentNode);
	      return true;
	    }

	    var tagName = stringToLowerCase(currentNode.nodeName);

	    _executeHook('uponSanitizeElement', currentNode, {
	      tagName: tagName,
	      allowedTags: ALLOWED_TAGS
	    });

	    if (!_isNode(currentNode.firstElementChild) && (!_isNode(currentNode.content) || !_isNode(currentNode.content.firstElementChild)) && regExpTest(/<[/\w]/g, currentNode.innerHTML) && regExpTest(/<[/\w]/g, currentNode.textContent)) {
	      _forceRemove(currentNode);
	      return true;
	    }

	    if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
	      
	      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
	        var parentNode = getParentNode(currentNode);
	        var childNodes = getChildNodes(currentNode);
	        var childCount = childNodes.length;
	        for (var i = childCount - 1; i >= 0; --i) {
	          parentNode.insertBefore(cloneNode(childNodes[i], true), getNextSibling(currentNode));
	        }
	      }

	      _forceRemove(currentNode);
	      return true;
	    }

	    if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
	      _forceRemove(currentNode);
	      return true;
	    }

	    if ((tagName === 'noscript' || tagName === 'noembed') && regExpTest(/<\/no(script|embed)/i, currentNode.innerHTML)) {
	      _forceRemove(currentNode);
	      return true;
	    }

	    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
	      
	      content = currentNode.textContent;
	      content = stringReplace(content, MUSTACHE_EXPR$$1, ' ');
	      content = stringReplace(content, ERB_EXPR$$1, ' ');
	      if (currentNode.textContent !== content) {
	        arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
	        currentNode.textContent = content;
	      }
	    }

	    _executeHook('afterSanitizeElements', currentNode, null);

	    return false;
	  };

	  var _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
	    
	    if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
	      return false;
	    }

	    if (ALLOW_DATA_ATTR && regExpTest(DATA_ATTR$$1, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$$1, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
	      return false;

	    } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$$1, stringReplace(value, ATTR_WHITESPACE$$1, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$$1, stringReplace(value, ATTR_WHITESPACE$$1, ''))) ; else if (!value) ; else {
	      return false;
	    }

	    return true;
	  };

	  var _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
	    var attr = void 0;
	    var value = void 0;
	    var lcName = void 0;
	    var l = void 0;
	    
	    _executeHook('beforeSanitizeAttributes', currentNode, null);

	    var attributes = currentNode.attributes;

	    if (!attributes) {
	      return;
	    }

	    var hookEvent = {
	      attrName: '',
	      attrValue: '',
	      keepAttr: true,
	      allowedAttributes: ALLOWED_ATTR
	    };
	    l = attributes.length;

	    while (l--) {
	      attr = attributes[l];
	      var _attr = attr,
	          name = _attr.name,
	          namespaceURI = _attr.namespaceURI;

	      value = stringTrim(attr.value);
	      lcName = stringToLowerCase(name);

	      hookEvent.attrName = lcName;
	      hookEvent.attrValue = value;
	      hookEvent.keepAttr = true;
	      hookEvent.forceKeepAttr = undefined; 
	      _executeHook('uponSanitizeAttribute', currentNode, hookEvent);
	      value = hookEvent.attrValue;
	      
	      if (hookEvent.forceKeepAttr) {
	        continue;
	      }

				if (currentNode.tagName !== "a") {
					_removeAttribute(name, currentNode);
				} else {
					var allowatt = ["type4link","id","link"];
					if (allowatt.indexOf(name)< 0) {
						_removeAttribute(name, currentNode);
					}
				}

	      if (!hookEvent.keepAttr) {
	        continue;
	      }

	      if (regExpTest(/\/>/i, value)) {
	        _removeAttribute(name, currentNode);
	        continue;
	      }

	      if (SAFE_FOR_TEMPLATES) {
	        value = stringReplace(value, MUSTACHE_EXPR$$1, ' ');
	        value = stringReplace(value, ERB_EXPR$$1, ' ');
	      }

	      var lcTag = currentNode.nodeName.toLowerCase();
	      if (!_isValidAttribute(lcTag, lcName, value)) {
	        continue;
	      }

	      try {
	        if (namespaceURI) {
	          currentNode.setAttributeNS(namespaceURI, name, value);
	        } else {
	          
	          currentNode.setAttribute(name, value);
	        }

	        arrayPop(DOMPurify.removed);
	      } catch (_) {}
	    }

	    _executeHook('afterSanitizeAttributes', currentNode, null);
	  };

	  var _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
	    var shadowNode = void 0;
	    var shadowIterator = _createIterator(fragment);

	    _executeHook('beforeSanitizeShadowDOM', fragment, null);

	    while (shadowNode = shadowIterator.nextNode()) {
	      
	      _executeHook('uponSanitizeShadowNode', shadowNode, null);

	      if (_sanitizeElements(shadowNode)) {
	        continue;
	      }

	      if (shadowNode.content instanceof DocumentFragment) {
	        _sanitizeShadowDOM(shadowNode.content);
	      }

	      _sanitizeAttributes(shadowNode);
	    }

	    _executeHook('afterSanitizeShadowDOM', fragment, null);
	  };

	  DOMPurify.sanitize = function (dirty, cfg) {
	    var body = void 0;
	    var importedNode = void 0;
	    var currentNode = void 0;
	    var oldNode = void 0;
	    var returnNode = void 0;
	    
	    if (!dirty) {
	      dirty = '<!-->';
	    }

	    if (typeof dirty !== 'string' && !_isNode(dirty)) {
	      
	      if (typeof dirty.toString !== 'function') {
	        throw typeErrorCreate('toString is not a function');
	      } else {
	        dirty = dirty.toString();
	        if (typeof dirty !== 'string') {
	          throw typeErrorCreate('dirty is not a string, aborting');
	        }
	      }
	    }

	    if (!DOMPurify.isSupported) {
	      if (_typeof(window.toStaticHTML) === 'object' || typeof window.toStaticHTML === 'function') {
	        if (typeof dirty === 'string') {
	          return window.toStaticHTML(dirty);
	        }

	        if (_isNode(dirty)) {
	          return window.toStaticHTML(dirty.outerHTML);
	        }
	      }

	      return dirty;
	    }

	    if (!SET_CONFIG) {
	      _parseConfig(cfg);
	    }

	    DOMPurify.removed = [];

	    if (typeof dirty === 'string') {
	      IN_PLACE = false;
	    }

	    if (IN_PLACE) ; else if (dirty instanceof Node) {
	      
	      body = _initDocument('<!---->');
	      importedNode = body.ownerDocument.importNode(dirty, true);
	      if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
	        
	        body = importedNode;
	      } else if (importedNode.nodeName === 'HTML') {
	        body = importedNode;
	      } else {
	        
	        body.appendChild(importedNode);
	      }
	    } else {
	      
	      if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT &&
	      
	      dirty.indexOf('<') === -1) {
	        return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
	      }

	      body = _initDocument(dirty);

	      if (!body) {
	        return RETURN_DOM ? null : emptyHTML;
	      }
	    }

	    if (body && FORCE_BODY) {
	      _forceRemove(body.firstChild);
	    }

	    var nodeIterator = _createIterator(IN_PLACE ? dirty : body);

	    while (currentNode = nodeIterator.nextNode()) {
	      
	      if (currentNode.nodeType === 3 && currentNode === oldNode) {
	        continue;
	      }

	      if (_sanitizeElements(currentNode)) {
	        continue;
	      }

	      if (currentNode.content instanceof DocumentFragment) {
	        _sanitizeShadowDOM(currentNode.content);
	      }

	      _sanitizeAttributes(currentNode);

	      oldNode = currentNode;
	    }

	    oldNode = null;

	    if (IN_PLACE) {
	      return dirty;
	    }

	    if (RETURN_DOM) {
	      if (RETURN_DOM_FRAGMENT) {
	        returnNode = createDocumentFragment.call(body.ownerDocument);

	        while (body.firstChild) {
	          
	          returnNode.appendChild(body.firstChild);
	        }
	      } else {
	        returnNode = body;
	      }

	      if (RETURN_DOM_IMPORT) {
	        
	        returnNode = importNode.call(originalDocument, returnNode, true);
	      }

	      return returnNode;
	    }

	    var serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;

	    if (SAFE_FOR_TEMPLATES) {
	      serializedHTML = stringReplace(serializedHTML, MUSTACHE_EXPR$$1, ' ');
	      serializedHTML = stringReplace(serializedHTML, ERB_EXPR$$1, ' ');
	    }

	    return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
	  };

	  DOMPurify.setConfig = function (cfg) {
	    _parseConfig(cfg);
	    SET_CONFIG = true;
	  };

	  DOMPurify.clearConfig = function () {
	    CONFIG = null;
	    SET_CONFIG = false;
	  };

	  DOMPurify.isValidAttribute = function (tag, attr, value) {
	    
	    if (!CONFIG) {
	      _parseConfig({});
	    }

	    var lcTag = stringToLowerCase(tag);
	    var lcName = stringToLowerCase(attr);
	    return _isValidAttribute(lcTag, lcName, value);
	  };

	  DOMPurify.addHook = function (entryPoint, hookFunction) {
	    if (typeof hookFunction !== 'function') {
	      return;
	    }

	    hooks[entryPoint] = hooks[entryPoint] || [];
	    arrayPush(hooks[entryPoint], hookFunction);
	  };

	  DOMPurify.removeHook = function (entryPoint) {
	    if (hooks[entryPoint]) {
	      arrayPop(hooks[entryPoint]);
	    }
	  };

	  DOMPurify.removeHooks = function (entryPoint) {
	    if (hooks[entryPoint]) {
	      hooks[entryPoint] = [];
	    }
	  };

	  DOMPurify.removeAllHooks = function () {
	    hooks = {};
	  };

	  return DOMPurify;
	}

	var purify = createDOMPurify();

	var globalWin  = window;
	var globalDoc  = document;

	var IMAGE_MIME_REGEX = /^image\/(p?jpe?g|gif|png|bmp)$/i;

function SCEditor(original, userOptions) {
  
  var base = this;

  var format;

  var db4reference = {};

  var editorContainer;

  var editorMode;
  var mathEditorMode;
  var mathMenu;
  var mathMenuCmds;
  var doc4editor;

  var mathjaxContainer;

  var mathjaxPreview;

  var mathjaxEditor;
  
  var mathjaxID4DOM;

  var mathjaxDisplay;
  
  var mathquillDOM;
  var mathquillEditor;
  var mathquillWYSIWYG;

  var mathaceDOM;
  var mathaceEditor;

  var editorMode = "wysiwyg"; 
  var mathEditorMode = "source"; 

  var editorRender;

  var mathjaxButtons;

  var eventHandlers = {};

  var toolbar;
  var mathtoolbar;
  var mathtoolbarExclude;

  var wysiwygEditor;

  var wysiwygWindow;

  var wysiwygHead;

  var wysiwygBody;

  var wysiwygDocument;

  var sourceEditor;

  var dropdown;

  var isComposing;

  var valueChangedKeyUpTimer;

  var locale;

  var preLoadCache = [];

  var rangeHelper;

  var btnStateHandlers = [];

  var pluginManager;

  var currentNode;

  var currentBlockNode;

  var currentSelection;

  var isSelectionCheckPending;

  var isRequired;

  var inlineCss;

  var shortcutHandlers = {};

  var autoExpandBounds;

  var autoExpandThrottle;

  var toolbarButtons = {};
  var mathtoolbarButtons = {};

  var maximizeScrollPosition;

  var pasteContentFragment;

  var allEmoticons = {};

  var icons;

  var	init,
    replaceEmoticons,
    handleCommand,
    initEditor,
    initLocale,
    initToolBar,
    initMathToolBar,
    initOptions,
    initEvents,
    initResize,
    initEmoticons,
    handlePasteEvt,
    handleCutCopyEvt,
    handlePasteData,
    handleKeyDown,
    handleBackSpace,
    handleKeyPress,
    handleFormReset,
    handleMouseDown,
    handleComposition,
    handleEvent,
    handleDocumentClick,
    updateToolBar,
    updateActiveButtons,
    sourceEditorSelectedText,
    appendNewLine,
    checkSelectionChanged,
    checkNodeChanged,
    autofocus,
    emoticonsKeyPress,
    emoticonsCheckWhitespace,
    currentStyledBlockNode,
    triggerValueChanged,
    valueChangedBlur,
    valueChangedKeyUp,
    autoUpdate,
    autoExpand;

  base.commands = extend(true, {}, (userOptions.commands || defaultCmds));

  base.mathcommands = userOptions.mathcommands || defaultMathCmds;

  var options = base.opts = extend(
    true, {}, defaultOptions, userOptions
  );

  base.opts.emoticons = userOptions.emoticons || defaultOptions.emoticons;

  if (!Array.isArray(options.allowedIframeUrls)) {
    options.allowedIframeUrls = [];
  }
  options.allowedIframeUrls.push('https:/'+ '/www.youtube-nocookie.com/embed/');

  var domPurify = purify();

  domPurify.addHook('uponSanitizeElement', function (node, data) {
    var allowedUrls = options.allowedIframeUrls;

    if (data.tagName === 'iframe') {
      var src = attr(node, 'src') || '';

      for (var i = 0; i < allowedUrls.length; i++) {
        var url = allowedUrls[i];

        if (isString(url) && src.substr(0, url.length) === url) {
          return;
        }

        if (url.test && url.test(src)) {
          return;
        }
      }

      remove(node);
    }
  });

  domPurify.addHook('afterSanitizeAttributes', function (node) {
    if ('target' in node) {
      attr(node, 'data-sce-target', attr(node, 'target'));
    }

    removeAttr(node, 'target');
  });

  function sanitize(html) {
    return domPurify.sanitize(html, {
      ADD_TAGS: ['iframe','math'],
      ADD_ATTR: ['allowfullscreen', 'frameborder', 'target','id','type4link','link']
    });
  }
  
  init = function () {
    original._sceditor = base;

    if (options.locale && options.locale !== 'en') {
      initLocale();
    }

    if (options.format === "html") {
      options.format = "xhtml";
    }

    if (options.db4reference && typeof(options.db4reference) === 'object') {
      db4reference = db4reference;
    }

    editorContainer = createElement('div', {
      className: 'sceditor-container'
    });

    insertBefore(editorContainer, original);
    css(editorContainer, 'z-index', options.zIndex);

    isRequired = original.required;
    original.required = false;
    if (SCEditor.formats[options.format]) {
    } else {
      options.format = "xhtml";
    }
    var FormatCtor = SCEditor.formats[options.format];
    
    format = FormatCtor ? new FormatCtor() : {"name4format":"undefformat"};
    
    pluginManager = new PluginManager(base);
    (options.plugins || '').split(',').forEach(function (plugin) {
      pluginManager.register(plugin.trim());
    });
    if ('init' in format) {
      format.init.call(base);
    }

    initEmoticons();
    initToolBar();
    
    initEditor();
    initOptions();
    initEvents();

    if (!isWysiwygSupported) {
      base.toggleSourceMode();
    }

    updateActiveButtons();

    var loaded = function () {
      off(globalWin, 'load', loaded);

      if (options.autofocus) {
        autofocus(!!options.autofocusEnd);
      }

      autoExpand();
      appendNewLine();
      
      pluginManager.call('ready');
      if ('onReady' in format) {
        format.onReady.call(base);
      }
    };
    on(globalWin, 'load', loaded);
    if (globalDoc.readyState === 'complete') {
      loaded();
    }
  };

  initLocale = function () {
    var lang;

    locale = SCEditor.locale[options.locale];

    if (!locale) {
      lang   = options.locale.split('-');
      locale = SCEditor.locale[lang[0]];
    }

    if (locale && locale.dateFormat) {
      options.dateFormat = locale.dateFormat;
    }
  };

  initEditor = function () {
    
    sourceEditor  = createElement('textarea');
    sourceEditor.setAttribute('sceditor-component','sourceEditor');
    
    sourceEditor.style.cssText = "font-family: monospace";
    
    wysiwygEditor = createElement('iframe', {
      frameborder: 0,
      allowfullscreen: true
    });
    wysiwygEditor.setAttribute('sceditor-component','wysiwygEditor');

    editorRender = createElement('div');
    editorRender.setAttribute('sceditor-component','editorRender');
    editorRender.setAttribute("status","done");

    mathjaxPreview = createElement('div');
    mathjaxPreview.setAttribute('sceditor-component','mathjaxPreview');

    mathjaxEditor = createElement('textarea',{
      "style":"width:100%;"
    });
    mathjaxEditor.setAttribute("rows","6");
    mathjaxEditor.setAttribute('sceditor-component','mathjaxEditor');
    mathjaxEditor.value = "F(x):=\\int_{a}^{b} f(x) \\, dx";

    mathMenu = createElement('div');
    mathMenu.setAttribute('sceditor-component','mathMenu');
    mathMenuCmds = options.mathMenuCmds || mathMenuCmds ;
    setTimeout(initMathToolBar,500,mathMenuCmds);

    mathaceDOM = createElement('div');
    mathaceDOM.setAttribute('sceditor-component','mathaceEditor');
    var mathacePRE = document.createElement('pre');
    mathacePRE.id = get_unique_id("MATHACE");
    mathacePRE.style.width = "100%";
    mathacePRE.style.position = 'relative';
    mathaceDOM.appendChild(mathacePRE);
    
    mathquillEditor = createElement('div');
    mathquillEditor.setAttribute('sceditor-component','mathquillEditor');
    mathquillDOM = createElement("span");
    mathquillDOM.setAttribute('sceditor-component','mathquillDOM');
    mathquillEditor.appendChild(mathquillDOM);
    mathquillEditor.appendChild(document.createTextNode("  "));
    var mathOpenSource = createElement('button');
    var iconOpenEdit = createElement('img');
    iconOpenEdit.setAttribute("src","img/icons-svg/edit-black.svg");
    mathOpenSource.appendChild(iconOpenEdit);
    mathquillEditor.appendChild(mathOpenSource);

    hide(mathquillEditor);

    var mathjaxOK = createElement('button');
    mathjaxOK.innerHTML = "OK";

    var mathjaxCancel = createElement('button');
    var iconCancel = createElement('img');
    iconCancel.setAttribute("src","img/icons-svg/fa-cancel-black.svg");
    mathjaxCancel.appendChild(iconCancel);

    mathjaxID4DOM = createElement('input');
    mathjaxID4DOM.setAttribute("type","text");
    mathjaxID4DOM.setAttribute("value",get_unique_id());
    hide(mathjaxID4DOM);
    
    var mathCloseSource = createElement('button');
    var iconCloseEdit = createElement('img');
    iconCloseEdit.setAttribute("src","img/icons-svg/edit-black.svg");
    mathCloseSource.appendChild(iconCloseEdit);
    mathCloseSource.addEventListener("click",function () {
      
      mathEditorMode = "wysiwyg";
      mathquillWYSIWYG.latex(mathjaxEditor.value);
      hide(mathjaxEditor);
      hide(mathMenu);
      show(mathquillEditor);
      hide(mathjaxPreview);
      hide(mathCloseSource);
    });
    hide(mathCloseSource);
    mathOpenSource.addEventListener("click",function () {
      
      mathEditorMode = "source";
      mathjaxEditor.value = mathquillWYSIWYG.latex();
      show(mathjaxEditor);
      show(mathMenu);
      hide(mathquillEditor);
      show(mathjaxPreview);
      show(mathCloseSource);
    });
    mathquillEditor.appendChild(mathOpenSource);

    mathjaxDisplay = createElement('select');
    var optInline = createElement('option');
    optInline.innerHTML = "inline";
    optInline.setAttribute("selected","selected");
    appendChild(mathjaxDisplay,optInline);
    var optBlock = createElement('option');
    optBlock.innerHTML = "block";
    appendChild(mathjaxDisplay,optBlock);
    on(mathjaxDisplay,"change",setMathBlockInline);

    if (window.MathQuill) {
      console.log("MathQuill is loaded exists");
      if (window.jQuery) {
        var MW;
        hide(mathMenu);
        show(mathquillEditor);
        
        var MQ = MathQuill.getInterface(2);
        mathquillWYSIWYG  = MQ.MathField(mathquillDOM, {
          handlers: {
            edit: function() {

            }
          }
        });

      } else {
        
        console.warn("MathQuill exists and is loaded, but MathQuill required JQuery to be loaded. Please load JQuery Version 1.5.2++");
      }
    } else {
      
    }
    mathjaxButtons = createElement('div');

    var mathjax_onchange = function () {
      setTimeout(renderMathEditor,500);
    }

    function openMathEditor(texstr,display,id) {
      
      if (texstr) {
        
        renderMathEditorPreview(texstr);
        if (!id) {
          alert("ERROR: math expression '"+texstr+"' has no unique ID")
        } else {
          mathjaxID4DOM.value = id;
          
        }
        if (display) {
        } else {
          display = "inline";
        }
        setMathEditorValue(texstr,display);

      }
      hide(wysiwygEditor);
      show(mathjaxContainer);
    }

    base.openMathEditor = openMathEditor;

    function closeMathEditor() {
      
      hide(mathjaxContainer);
      show(wysiwygEditor);
    }

    base.closeMathEditor = closeMathEditor;

    mathjaxEditor.addEventListener('keypress', mathjax_onchange);
    mathjaxEditor.addEventListener('onchange', mathjax_onchange);
    mathjaxOK.addEventListener('click',function (e) {
      editorRender.innerHTML = "";
      mathjax_onchange();
      updateMath4Editor(mathjaxID4DOM.value,getMathEditorValue(),mathjaxDisplay.value);
      closeMathEditor();
    });
    mathjaxCancel.addEventListener('click',function (e) {
      closeMathEditor();;
      
    });
    
    mathjax_onchange();
    mathjaxPreview.innerHTML = "\\( \\displaystyle " + getMathEditorValue() + "\\)";
    appendChild(mathjaxButtons,mathjaxOK);
    appendChild(mathjaxButtons,mathjaxCancel);
    appendChild(mathjaxButtons,mathCloseSource);
    appendChild(mathjaxButtons,mathjaxID4DOM);
    appendChild(mathjaxButtons,mathjaxDisplay);
    mathjaxPreview = createElement('div',{
      "style":"width:90%;"
    });
    mathjaxContainer = createElement('div');
    mathjaxContainer.setAttribute("sceditor-component","mathjaxContainer");
    addClass(mathjaxContainer,"sceditor-dropdown");
    mathjaxContainer.style.cssText = "width:98%;postion:relative;text-align: center;background:#eee";
    hide(mathjaxContainer);

    appendChild(editorContainer,editorRender);
    hide(editorRender);

    appendChild(mathjaxContainer,mathMenu);
    appendChild(mathjaxContainer,mathaceDOM);
    appendChild(mathjaxContainer,mathjaxEditor);
    appendChild(mathjaxContainer,createElement('hr'));
    appendChild(mathjaxContainer,mathquillEditor);
    appendChild(mathjaxContainer,mathjaxPreview);
    appendChild(mathjaxContainer,createElement('hr'));
    appendChild(mathjaxContainer,mathjaxButtons);
    appendChild(mathjaxContainer,createElement('hr'));

    if (window.ace) {
      
      mathaceEditor = window.ace.edit(mathacePRE);
      
      var mode = "tex";
      console.log("Mode ACE Editor: '"+mode+"' Theme: 'xcode'");
      mathaceEditor.session.setMode('ace/mode/'+mode);

      hide(mathjaxEditor);
      mathaceEditor.on('change',function() {
        var texstr = mathaceEditor.getValue();
        renderMathEditorPreview(texstr);
        alert("ACE onchange event '"+texstr+"'")
      });
      mathaceEditor.setValue("ACE Editor with \\latex commands");
    } else {
    }

    if (options.startInSourceMode) {
      addClass(editorContainer, 'sourceMode');
      editorMode = "source";
      hide(wysiwygEditor);
    } else {
      addClass(editorContainer, 'wysiwygMode');
      hide(sourceEditor);
      editorMode = "wysiwyg";
    }

    if (!options.spellcheck) {
      attr(editorContainer, 'spellcheck', 'false');
    }

    if (globalWin.location.protocol === 'https:') {
      attr(wysiwygEditor, 'src', 'about:blank');
    }
    options.config4mathjax = options.config4mathjax || "TeX-AMS_SVG";
    options.path4mathjax = options.path4mathjax || "mathjax/MathJax.js?config=";
    options.url4mathjax = options.mathjax || options.url4mathjax || (options.path4mathjax + options.config4mathjax);
    
    options.url4mathjax = options.url4mathjax.replace(/["' ]/g,"");
    
    options.script4mathjax = '<script src="' + options.url4mathjax + '"></script>';

    appendChild(editorContainer, mathjaxContainer);
    appendChild(editorContainer, wysiwygEditor);
    appendChild(editorContainer, sourceEditor);

    base.dimensions(
      options.width || width(original),
      options.height || height(original)
    );

    var className = ios ? ' ios' : '';

    wysiwygDocument = wysiwygEditor.contentDocument;
    wysiwygDocument.open();
    var vHTML = _tmpl('html', {
      attrs: ' class="' + className + '"',
      spellcheck: options.spellcheck ? '' : 'spellcheck="false"',
      charset: options.charset,
      style: options.style,
      script4mathjax: " "

    });
    
    wysiwygDocument.write(vHTML);
    wysiwygDocument.close();

    wysiwygHead   = wysiwygDocument.head;
    wysiwygBody   = wysiwygDocument.body;
    wysiwygWindow = wysiwygEditor.contentWindow;

    base.readOnly(!!options.readOnly);

    if (ios) {
      height(wysiwygBody, '100%');
      on(wysiwygBody, 'touchend', base.focus);
    }

    var tabIndex = attr(original, 'tabindex');
    attr(sourceEditor, 'tabindex', tabIndex);
    attr(wysiwygEditor, 'tabindex', tabIndex);

    rangeHelper = new RangeHelper(wysiwygWindow, null, sanitize);

    hide(original);
    base.val(original.value);

    var placeholder = options.placeholder ||
      attr(original, 'placeholder');

    if (placeholder) {
      sourceEditor.placeholder = placeholder;
      attr(wysiwygBody, 'placeholder', placeholder);
    };
    if (window.MathJax) {
      
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, mathjaxPreview]);
    };

  };

  initOptions = function () {
    
    if (options.autoUpdate) {
      on(wysiwygBody, 'blur', autoUpdate);
      on(sourceEditor, 'blur', autoUpdate);
    }

    if (options.rtl === null) {
      options.rtl = css(sourceEditor, 'direction') === 'rtl';
    }

    base.rtl(!!options.rtl);

    if (options.autoExpand) {
      
      on(wysiwygBody, 'load', autoExpand, EVENT_CAPTURE);
      on(wysiwygBody, 'input keyup', autoExpand);
    }

    if (options.resizeEnabled) {
      initResize();
    }

    attr(editorContainer, 'id', options.id);
    base.emoticons(options.emoticonsEnabled);
  };

  initEvents = function () {
    var form = original.form;
    var compositionEvents = 'compositionstart compositionend';
    var eventsToForward =
      'keydown keyup keypress focus blur contextmenu input';
    var checkSelectionEvents = 'onselectionchange' in wysiwygDocument ?
      'selectionchange' :
      'keyup focus blur contextmenu mouseup touchend click';

    on(globalDoc, 'click', handleDocumentClick);

    if (form) {
      on(form, 'reset', handleFormReset);
      on(form, 'submit', base.updateOriginal, EVENT_CAPTURE);
    }

    on(window, 'pagehide', base.updateOriginal);
    on(window, 'pageshow', handleFormReset);
    on(wysiwygBody, 'keypress', handleKeyPress);
    on(wysiwygBody, 'keydown', handleKeyDown);
    on(wysiwygBody, 'keydown', handleBackSpace);
    on(wysiwygBody, 'keyup', appendNewLine);
    on(wysiwygBody, 'blur', valueChangedBlur);
    on(wysiwygBody, 'keyup', valueChangedKeyUp);
    on(wysiwygBody, 'paste', handlePasteEvt);
    on(wysiwygBody, 'cut copy', handleCutCopyEvt);
    on(wysiwygBody, compositionEvents, handleComposition);
    on(wysiwygBody, checkSelectionEvents, checkSelectionChanged);
    on(wysiwygBody, eventsToForward, handleEvent);

    if (options.emoticonsCompat && globalWin.getSelection) {
      on(wysiwygBody, 'keyup', emoticonsCheckWhitespace);
    }

    on(wysiwygBody, 'blur', function () {
      if (!base.val()) {
        addClass(wysiwygBody, 'placeholder');
      }
    });

    on(wysiwygBody, 'focus', function () {
      removeClass(wysiwygBody, 'placeholder');
    });

    on(sourceEditor, 'blur', valueChangedBlur);
    on(sourceEditor, 'keyup', valueChangedKeyUp);
    on(sourceEditor, 'keydown', handleKeyDown);
    on(sourceEditor, compositionEvents, handleComposition);
    on(sourceEditor, eventsToForward, handleEvent);

    on(wysiwygDocument, 'mousedown', handleMouseDown);
    on(wysiwygDocument, checkSelectionEvents, checkSelectionChanged);
    on(wysiwygDocument, 'keyup', appendNewLine);

    on(editorContainer, 'selectionchanged', checkNodeChanged);
    on(editorContainer, 'selectionchanged', updateActiveButtons);
    
    on(
      editorContainer,
      'selectionchanged valuechanged nodechanged pasteraw paste',
      handleEvent
    );
  };

  initToolBar = function () {
    var	group,
      commands = base.commands,
      exclude  = (options.toolbarExclude || '').split(','),
      groups   = (options.toolbar || '').split('|');

    toolbar = createElement('div', {
      className: 'sceditor-toolbar',
      unselectable: 'on'
    });

    if (options.icons in SCEditor.icons) {
      icons = new SCEditor.icons[options.icons]();
    } else {
      console.warn("No Icon Library defined in options.icons - use monocons instead");
      if (SCEditor.icons.hasOwnProperty("monocons")) {
        icons = new SCEditor.icons["monocons"]();
      } else {
        console.warn("Monocons Icons are not defined");
      }
    }
    
    each(groups, function (_, menuItems) {
      group = createElement('div', {
        className: 'sceditor-group'
      });
      
      each(menuItems.split(','), function (_, commandName) {
        var	button, shortcut,
          command  = commands[commandName];

        if (!command || exclude.indexOf(commandName) > -1) {
          return;
        }
        
        if (commandName == "mathexpr") {
          if (!(window.MathJax || window.MathQuill)) {
            
            return ;
          }
        }
        shortcut = command.shortcut;
        button   = _tmpl('toolbarButton', {
          name: commandName,
          dispName: base._(command.name ||
              command.tooltip || commandName)
        }, true).firstChild;

        if (icons && icons.create) {
          var icon = icons.create(commandName);
          if (icon) {
            insertBefore(icons.create(commandName),
              button.firstChild);
            addClass(button, 'has-icon');
          }
        }

        button._sceTxtMode = !!command.txtExec;
        button._sceWysiwygMode = !!command.exec;
        toggleClass(button, 'disabled', !command.exec);
        on(button, 'click', function (e) {
          if (!hasClass(button, 'disabled')) {
            console.log("sceditor.js:6200 - Button command.exec='"+command.exec+"' is handled. ");
            handleCommand(button, command);
          } else {
            console.log("sceditor.js:6202 - Button command.exec='"+command.exec+"' nothing performed!");
          }

          updateActiveButtons();
          e.preventDefault();
        });
        
        on(button, 'mousedown', function (e) {
          base.closeDropDown();
          e.preventDefault();
        });

        if (command.tooltip) {
          attr(button, 'name',
            base._(command.tooltip) +
              (shortcut ? ' (' + shortcut + ')' : '')
          );
        }

        if (shortcut) {
          base.addShortcut(shortcut, commandName);
        }

        if (command.state) {
          btnStateHandlers.push({
            name: commandName,
            state: command.state
          });
        
        } else if (isString(command.exec)) {
          btnStateHandlers.push({
            name: commandName,
            state: command.exec
          });
        }

        appendChild(group, button);
        toolbarButtons[commandName] = button;
      });

      if (group.firstChild) {
        appendChild(toolbar, group);
      }
    });

    appendChild(options.toolbarContainer || editorContainer, toolbar);
  };

  var mathtoolbarDefault = "";
  var mathtoolbarExclude = "";

  var prepareMathToolBar = function (pMathCmds) {
    pMathCmds = pMathCmds || defaultMathCmds;
    var mgroup = [];
    var exclude = [];
    
    for (var i = 0; i < pMathCmds.length; i++) {
      var macmd = pMathCmds[i];
      var mbtns  = [];
      for (var k = 0; k < macmd.btns.length; k++) {
        var m = macmd.btns[k];
        if (!m.hasOwnProperty("name")) {
          if (m.latex) {
            m["name"] = m.latex.replace(/[^A-Za-z0-9]/g,"");
          }
        };
        if (!m.math4icon) {
          if (m.latex) {
            
            m["math4icon"] = m.latex;
          }
        };
        base.mathcommands[m.name] = m;
        if (m.hasOwnProperty("exclude") && (m.exclude == true)) {
          exclude.push(m.name);
        };
        mbtns.push(m.name);
      };
      var btns = mbtns.join(",");
      
      mgroup.push(btns);
    }
    
    mathtoolbarDefault = mgroup.join("|");
    
    mathtoolbarExclude = exclude.join(",");
  }

  function getLatex4MathCmds(pCmdID) {
    var latex = "1+2=3";
    var	grec,mathcmd;
    var	mathcommands = base.mathcommands;
    if (mathcommands && pCmdID) {
      for (var g = 0; g < mathcommands.length; g++) {
        grec = mathcommands[g];
        for (var i = 0; i < grec.btns.length; i++) {
          mathcmd = grec.btns[i];
          
          if (mathcmd.name == pCmdID) {
            latex = mathcmd.latex;
          } 
        } 
      } 
    } 
    return latex;
  }

  base.getLatex4MathCmds = getLatex4MathCmds;

  initMathToolBar = function (pMathCmds) {
    pMathCmds = pMathCmds || defaultMathCmds;
    
    prepareMathToolBar(pMathCmds);
    options.mathtoolbar = options.mathtoolbar || mathtoolbarDefault || '';
    
    var	group,
      mathcommands = base.mathcommands,
      exclude  = (options.mathtoolbarExclude || mathtoolbarExclude).split(','),
      groups   = (options.mathtoolbar || mathtoolbarDefault).split('|');
      mathtoolbar = createElement('div', {
        className: 'sceditor-mathtoolbar'
      });

    if (options.icons in SCEditor.icons) {
      icons = new SCEditor.icons[options.icons]();
    }
    var groupicons = createElement('span', {
       className: 'sceditor-mathgroupicons'
    });
    mathtoolbar.appendChild(groupicons);
    
    each(groups, function (_, menuItems) {
      group = createElement('span', {
        className: 'sceditor-mathgroup'
      });
      
      group.innerHTML = "&nbsp;&nbsp;";
      each(menuItems.split(','), function (_, commandName) {
        var	button, shortcut, command, span, buttonspan;
        if (mathcommands) {
          command  = mathcommands[commandName];
        } else {
          return ;
        }

        if (exclude.indexOf(commandName) > -1) {
        
          return;
        }

        shortcut = command.shortcut;

        button = createElement('button');
        
        button.style.cssText = "border:none;padding: 10";
        button.setAttribute('href','#');
        span  = createElement('span');
        span.innerHTML = "$$" + (command.math4icon || "?") + "$$";
        button.appendChild(span);

        toggleClass(button, 'disabled', false);
        on(button, 'click', function (e) {
          if (!hasClass(button, 'disabled')) {
            console.log("sceditor.js:7424 - math Button command.latex='"+command.latex+"' is handled. ");
            handleMathCommand(button, command);
          } else {
            console.log("sceditor.js:7427 - Button command.latex='"+command.exec+"' nothing performed!");
          }

          updateActiveButtons();
          e.preventDefault();
        });
        
        on(button, 'mousedown', function (e) {
          base.closeDropDown();
          e.preventDefault();
        });

        if (command.tooltip) {
          attr(button, 'name',
            base._(command.tooltip) +
              (shortcut ? ' (' + shortcut + ')' : '')
          );
        }

        if (shortcut) {
          base.addShortcut(shortcut, commandName);
        }

        if (command.state) {
          btnStateHandlers.push({
            name: commandName,
            state: command.state
          });
        
        } else if (isString(command.exec)) {
          btnStateHandlers.push({
            name: commandName,
            state: command.exec
          });
        }
        buttonspan = createElement('span');
        appendChild(buttonspan, button);
        appendChild(group, buttonspan);
        mathtoolbarButtons[commandName] = button;
      });

      if (group.firstChild) {
        appendChild(mathtoolbar, group);
      }
    });
    
    appendChild(options.mathtoolbarContainer  || mathMenu || editorContainer, mathtoolbar);
  };

  initResize = function () {
    var	minHeight, maxHeight, minWidth, maxWidth,
      mouseMoveFunc, mouseUpFunc,
      grip        = createElement('div', {
        className: 'sceditor-grip'
      }),

      cover       = createElement('div', {
        className: 'sceditor-resize-cover'
      }),
      moveEvents  = 'touchmove mousemove',
      endEvents   = 'touchcancel touchend mouseup',
      startX      = 0,
      startY      = 0,
      newX        = 0,
      newY        = 0,
      startWidth  = 0,
      startHeight = 0,
      origWidth   = width(editorContainer),
      origHeight  = height(editorContainer),
      isDragging  = false,
      rtl         = base.rtl();

    minHeight = options.resizeMinHeight || origHeight / 1.5;
    maxHeight = options.resizeMaxHeight || origHeight * 2.5;
    minWidth  = options.resizeMinWidth  || origWidth  / 1.25;
    maxWidth  = options.resizeMaxWidth  || origWidth  * 1.25;

    mouseMoveFunc = function (e) {
      
      if (e.type === 'touchmove') {
        e    = globalWin.event;
        newX = e.changedTouches[0].pageX;
        newY = e.changedTouches[0].pageY;
      } else {
        newX = e.pageX;
        newY = e.pageY;
      }

      var	newHeight = startHeight + (newY - startY),
        newWidth  = rtl ?
          startWidth - (newX - startX) :
          startWidth + (newX - startX);

      if (maxWidth > 0 && newWidth > maxWidth) {
        newWidth = maxWidth;
      }
      if (minWidth > 0 && newWidth < minWidth) {
        newWidth = minWidth;
      }
      if (!options.resizeWidth) {
        newWidth = false;
      }

      if (maxHeight > 0 && newHeight > maxHeight) {
        newHeight = maxHeight;
      }
      if (minHeight > 0 && newHeight < minHeight) {
        newHeight = minHeight;
      }
      if (!options.resizeHeight) {
        newHeight = false;
      }

      if (newWidth || newHeight) {
        base.dimensions(newWidth, newHeight);
      }

      e.preventDefault();
    };

    mouseUpFunc = function (e) {
      if (!isDragging) {
        return;
      }

      isDragging = false;

      hide(cover);
      removeClass(editorContainer, 'resizing');
      off(globalDoc, moveEvents, mouseMoveFunc);
      off(globalDoc, endEvents, mouseUpFunc);

      e.preventDefault();
    };

    if (icons && icons.create) {
      var icon = icons.create('grip');
      if (icon) {
        appendChild(grip, icon);
        addClass(grip, 'has-icon');
      }
    }

    appendChild(editorContainer, grip);
    appendChild(editorContainer, cover);
    hide(cover);

    on(grip, 'touchstart mousedown', function (e) {
      
      if (e.type === 'touchstart') {
        e      = globalWin.event;
        startX = e.touches[0].pageX;
        startY = e.touches[0].pageY;
      } else {
        startX = e.pageX;
        startY = e.pageY;
      }

      startWidth  = width(editorContainer);
      startHeight = height(editorContainer);
      isDragging  = true;

      addClass(editorContainer, 'resizing');
      show(cover);
      on(globalDoc, moveEvents, mouseMoveFunc);
      on(globalDoc, endEvents, mouseUpFunc);

      e.preventDefault();
    });
  };

  initEmoticons = function () {
    var	emoticons = options.emoticons;
    var root      = options.emoticonsRoot || '';

    if (emoticons) {
      allEmoticons = extend(
        {}, emoticons.more, emoticons.dropdown, emoticons.hidden
      );
    }

    each(allEmoticons, function (key, url) {
      allEmoticons[key] = _tmpl('emoticon', {
        key: key,
        
        url: root + (url.url || url),
        tooltip: url.tooltip || key
      });

      if (options.emoticonsEnabled) {
        preLoadCache.push(createElement('img', {
          src: root + (url.url || url)
        }));
      }
    });
  };

  autofocus = function (focusEnd) {
    var	range, txtPos,
      node = wysiwygBody.firstChild;

    if (!isVisible(editorContainer)) {
      return;
    }

    if (base.sourceMode()) {
      txtPos = focusEnd ? sourceEditor.value.length : 0;

      sourceEditor.setSelectionRange(txtPos, txtPos);

      return;
    }

    removeWhiteSpace(wysiwygBody);

    if (focusEnd) {
      if (!(node = wysiwygBody.lastChild)) {
        node = createElement('p', {}, wysiwygDocument);
        appendChild(wysiwygBody, node);
      }

      while (node.lastChild) {
        node = node.lastChild;

        if (is(node, 'br') && node.previousSibling) {
          node = node.previousSibling;
        }
      }
    }

    range = wysiwygDocument.createRange();

    if (!canHaveChildren(node)) {
      range.setStartBefore(node);

      if (focusEnd) {
        range.setStartAfter(node);
      }
    } else {
      range.selectNodeContents(node);
    }

    range.collapse(!focusEnd);
    rangeHelper.selectRange(range);
    currentSelection = range;

    if (focusEnd) {
      wysiwygBody.scrollTop = wysiwygBody.scrollHeight;
    }

    base.focus();
  };

  base.readOnly = function (readOnly) {
    if (typeof readOnly !== 'boolean') {
      return !sourceEditor.readonly;
    }

    wysiwygBody.contentEditable = !readOnly;
    sourceEditor.readonly = !readOnly;

    updateToolBar(readOnly);

    return base;
  };

  base.rtl = function (rtl) {
    var dir = rtl ? 'rtl' : 'ltr';

    if (typeof rtl !== 'boolean') {
      return attr(sourceEditor, 'dir') === 'rtl';
    }

    attr(wysiwygBody, 'dir', dir);
    attr(sourceEditor, 'dir', dir);

    removeClass(editorContainer, 'rtl');
    removeClass(editorContainer, 'ltr');
    addClass(editorContainer, dir);

    if (icons && icons.rtl) {
      icons.rtl(rtl);
    }

    return base;
  };

  updateToolBar = function (disable) {
    var mode = base.inSourceMode() ? '_sceTxtMode' : '_sceWysiwygMode';

    each(toolbarButtons, function (_, button) {
      toggleClass(button, 'disabled', disable || !button[mode]);
    });
  };

  base.width = function (width$1, saveWidth) {
    if (!width$1 && width$1 !== 0) {
      return width(editorContainer);
    }

    base.dimensions(width$1, null, saveWidth);

    return base;
  };

  base.dimensions = function (width$1, height$1, save) {
    
    width$1  = (!width$1 && width$1 !== 0) ? false : width$1;
    height$1 = (!height$1 && height$1 !== 0) ? false : height$1;

    if (width$1 === false && height$1 === false) {
      return { width: base.width(), height: base.height() };
    }

    if (width$1 !== false) {
      if (save !== false) {
        options.width = width$1;
      }

      width(editorContainer, width$1);
    }

    if (height$1 !== false) {
      if (save !== false) {
        options.height = height$1;
      }

      height(editorContainer, height$1);
    }

    return base;
  };

  base.height = function (height$1, saveHeight) {
    if (!height$1 && height$1 !== 0) {
      return height(editorContainer);
    }

    base.dimensions(null, height$1, saveHeight);

    return base;
  };

  base.maximize = function (maximize) {
    var maximizeSize = 'sceditor-maximize';

    if (isUndefined(maximize)) {
      return hasClass(editorContainer, maximizeSize);
    }

    maximize = !!maximize;

    if (maximize) {
      maximizeScrollPosition = globalWin.pageYOffset;
    }

    toggleClass(globalDoc.documentElement, maximizeSize, maximize);
    toggleClass(globalDoc.body, maximizeSize, maximize);
    toggleClass(editorContainer, maximizeSize, maximize);
    base.width(maximize ? '100%' : options.width, false);
    base.height(maximize ? '100%' : options.height, false);

    if (!maximize) {
      globalWin.scrollTo(0, maximizeScrollPosition);
    }

    autoExpand();

    return base;
  };

  autoExpand = function () {
    if (options.autoExpand && !autoExpandThrottle) {
      autoExpandThrottle = setTimeout(base.expandToContent, 200);
    }
  };

  base.expandToContent = function (ignoreMaxHeight) {
    if (base.maximize()) {
      return;
    }

    clearTimeout(autoExpandThrottle);
    autoExpandThrottle = false;

    if (!autoExpandBounds) {
      var height$1 = options.resizeMinHeight || options.height ||
        height(original);

      autoExpandBounds = {
        min: height$1,
        max: options.resizeMaxHeight || (height$1 * 2)
      };
    }

    var range = globalDoc.createRange();
    range.selectNodeContents(wysiwygBody);

    var rect = range.getBoundingClientRect();
    var current = wysiwygDocument.documentElement.clientHeight - 1;
    var spaceNeeded = rect.bottom - rect.top;
    var newHeight = base.height() + 1 + (spaceNeeded - current);

    if (!ignoreMaxHeight && autoExpandBounds.max !== -1) {
      newHeight = Math.min(newHeight, autoExpandBounds.max);
    }

    base.height(Math.ceil(Math.max(newHeight, autoExpandBounds.min)));
  };

  base.destroy = function () {
    
    if (!pluginManager) {
      return;
    }

    pluginManager.destroy();

    rangeHelper   = null;
    pluginManager = null;

    if (dropdown) {
      remove(dropdown);
    }

    off(globalDoc, 'click', handleDocumentClick);

    var form = original.form;
    if (form) {
      off(form, 'reset', handleFormReset);
      off(form, 'submit', base.updateOriginal, EVENT_CAPTURE);
    }

    off(window, 'pagehide', base.updateOriginal);
    off(window, 'pageshow', handleFormReset);
    remove(sourceEditor);
    remove(toolbar);
    remove(MathToolBar);
    remove(editorContainer);

    delete original._sceditor;
    show(original);

    original.required = isRequired;
  };

  base.createDropDown = function (menuItem, name, content) {
    
    var	dropDownCss,
      dropDownClass = 'sceditor-' + name;

    base.closeDropDown();

    if (dropdown && hasClass(dropdown, dropDownClass)) {
      return;
    }

    dropDownCss = extend({
      top: menuItem.offsetTop,
      left: menuItem.offsetLeft,
      marginTop: menuItem.clientHeight
    }, options.dropDownCss);

    dropdown = createElement('div', {
      className: 'sceditor-dropdown ' + dropDownClass
    });

    css(dropdown, dropDownCss);
    appendChild(dropdown, content);
    appendChild(editorContainer, dropdown);
    on(dropdown, 'click focusin', function (e) {
      
      e.stopPropagation();
    });

    if (dropdown) {
      var first = find(dropdown, 'input,textarea')[0];
      if (first) {
        first.focus();
      }
    }
  };

  handleDocumentClick = function (e) {
    
    if (e.which !== 3 && dropdown && !e.defaultPrevented) {
      autoUpdate();

      base.closeDropDown();
    }
  };

  handleCutCopyEvt = function (e) {
    var range = rangeHelper.selectedRange();
    if (range) {
      var container = createElement('div', {}, wysiwygDocument);
      var firstParent;

      var parent = range.commonAncestorContainer;
      while (parent && isInline(parent, true)) {
        if (parent.nodeType === ELEMENT_NODE) {
          var clone = parent.cloneNode();
          if (container.firstChild) {
            appendChild(clone, container.firstChild);
          }

          appendChild(container, clone);
          firstParent = firstParent || clone;
        }
        parent = parent.parentNode;
      }

      appendChild(firstParent || container, range.cloneContents());
      removeWhiteSpace(container);

      e.clipboardData.setData('text/html', container.innerHTML);

      each(find(container, 'p'), function (_, elm) {
        convertElement(elm, 'div');
      });
      
      each(find(container, 'br'), function (_, elm) {
        if (!elm.nextSibling || !isInline(elm.nextSibling, true)) {
          remove(elm);
        }
      });

      appendChild(wysiwygBody, container);
      e.clipboardData.setData('text/plain', container.innerText);
      remove(container);

      if (e.type === 'cut') {
        range.deleteContents();
      }

      e.preventDefault();
    }
  };

  handlePasteEvt = function (e) {
    var editable = wysiwygBody;
    var clipboard = e.clipboardData;
    var loadImage = function (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        handlePasteData({
          html: '<img src="' + e.target.result + '" />'
        });
      };
      reader.readAsDataURL(file);
    };

    if (clipboard) {
      var data = {};
      var types = clipboard.types;
      var items = clipboard.items;

      e.preventDefault();

      for (var i = 0; i < types.length; i++) {

        if (types.indexOf('text/html') < 0) {
          
          if (globalWin.FileReader && items &&
            IMAGE_MIME_REGEX.test(items[i].type)) {
            return loadImage(clipboard.items[i].getAsFile());
          }
        }

        data[types[i]] = clipboard.getData(types[i]);
      }
      
      data.text = data['text/plain'];
      data.html = sanitize(data['text/html']);

      handlePasteData(data);

    } else if (!pasteContentFragment) {

      var scrollTop = editable.scrollTop;

      rangeHelper.saveRange();

      pasteContentFragment = globalDoc.createDocumentFragment();
      while (editable.firstChild) {
        appendChild(pasteContentFragment, editable.firstChild);
      }

      setTimeout(function () {
        var html = editable.innerHTML;

        editable.innerHTML = '';
        appendChild(editable, pasteContentFragment);
        editable.scrollTop = scrollTop;
        pasteContentFragment = false;

        rangeHelper.restoreRange();

        handlePasteData({ html: sanitize(html) });
      }, 0);
    }
  };

  handlePasteData = function (data) {
    var pasteArea = createElement('div', {}, wysiwygDocument);

    pluginManager.call('pasteRaw', data);
    trigger(editorContainer, 'pasteraw', data);

    if (data.html) {
      
      pasteArea.innerHTML = sanitize(data.html);

      fixNesting(pasteArea);
    } else {
      pasteArea.innerHTML = entities(data.text || '');
    }

    var paste = {
      val: pasteArea.innerHTML
    };

    if ('fragmentToSource' in format) {
      paste.val = format
        .fragmentToSource(paste.val, wysiwygDocument, currentNode);
    }

    pluginManager.call('paste', paste);
    trigger(editorContainer, 'paste', paste);

    if ('fragmentToHtml' in format) {
      paste.val = format
        .fragmentToHtml(paste.val, currentNode);
    }

    pluginManager.call('pasteHtml', paste);

    var parent = rangeHelper.getFirstBlockParent();
    base.wysiwygEditorInsertHtml(paste.val, null, true);
    merge(parent);
  };

  base.closeDropDown = function (focus) {
    if (dropdown) {
      remove(dropdown);
      dropdown = null;
    }

    if (focus === true) {
      base.focus();
    }
  };

  base.wysiwygEditorInsertHtml = function (
    html, endHtml, overrideCodeBlocking
  ) {
    var	marker, scrollTop, scrollTo,
      editorHeight = height(wysiwygEditor);

    base.focus();

    if (!overrideCodeBlocking && closest(currentBlockNode, 'code')) {
      return;
    }

    rangeHelper.insertHTML(html, endHtml);
    rangeHelper.saveRange();
    replaceEmoticons();

    fixNesting(wysiwygBody);

    marker   = find(wysiwygBody, '#sceditor-end-marker')[0];
    show(marker);
    scrollTop = wysiwygBody.scrollTop;
    scrollTo  = (getOffset(marker).top +
      (marker.offsetHeight * 1.5)) - editorHeight;
    hide(marker);

    if (scrollTo > scrollTop || scrollTo + editorHeight < scrollTop) {
      wysiwygBody.scrollTop = scrollTo;
    }

    triggerValueChanged(false);
    rangeHelper.restoreRange();

    appendNewLine();
  };

  base.wysiwygEditorInsertText = function (text, endText) {
    base.wysiwygEditorInsertHtml(
      entities(text), entities(endText)
    );
  };

  base.insertText = function (text, endText) {
    if (base.inSourceMode()) {
      base.sourceEditorInsertText(text, endText);
    } else {
      base.wysiwygEditorInsertText(text, endText);
    }

    return base;
  };

  base.insertTextAtCursor = function (el, text) {
    console.log("sceditor.js:8481 - base.insertTextAtCursor() inserted text='"+text+"'");
    var val = el.value, endIndex, range, doc = el.ownerDocument;
    if (typeof el.selectionStart == "number"
            && typeof el.selectionEnd == "number") {
        endIndex = el.selectionEnd;
        el.value = val.slice(0, endIndex) + text + val.slice(endIndex);
        el.selectionStart = el.selectionEnd = endIndex + text.length;
    } else if (doc.selection != "undefined" && doc.selection.createRange) {
        el.focus();
        range = doc.selection.createRange();
        range.collapse(false);
        range.text = text;
        range.select();
    }
  }

  base.sourceEditorInsertText = function (text, endText) {
    var scrollTop, currentValue,
      startPos = sourceEditor.selectionStart,
      endPos   = sourceEditor.selectionEnd;

    scrollTop = sourceEditor.scrollTop;
    sourceEditor.focus();
    currentValue = sourceEditor.value;

    if (endText) {
      text += currentValue.substring(startPos, endPos) + endText;
    }

    sourceEditor.value = currentValue.substring(0, startPos) +
      text +
      currentValue.substring(endPos, currentValue.length);

    sourceEditor.selectionStart = (startPos + text.length) -
      (endText ? endText.length : 0);
    sourceEditor.selectionEnd = sourceEditor.selectionStart;

    sourceEditor.scrollTop = scrollTop;
    sourceEditor.focus();

    triggerValueChanged();
  };

  base.getRangeHelper = function () {
    return rangeHelper;
  };

  base.getWysiwygDocument = function () {
    return wysiwygDocument;
  };

  base.sourceEditorCaret = function (position) {
    sourceEditor.focus();

    if (position) {
      sourceEditor.selectionStart = position.start;
      sourceEditor.selectionEnd = position.end;

      return this;
    }

    return {
      start: sourceEditor.selectionStart,
      end: sourceEditor.selectionEnd
    };
  };

   base.getValue = function (filter) {
     var ret_val = "undefined editor value";
     if (base.inSourceMode()) {
       ret_val = base.getSourceEditorValue(false);
     } else {
       if (filter) {
         ret_val = base.getWysiwygEditorValue(filter);
       } else {
         ret_val = base.getWysiwygEditorValue();
       }
    }
    return ret_val
  }

  base.setValue = function (val, filter) {
    if (val) {
      if (!base.inSourceMode()) {
        console.log("sceditor.js:7352 - sceditor.setValue('"+val+"',filter) is SOURCE MODE");
        if (filter !== false && 'toHtml' in format) {
          val = format.toHtml(val);
        }
        console.log("sceditor.js:8684 - sceditor.setValue(va,filter) to WYSIWYG MODE val='"+val+"'");
        base.setWysiwygEditorValue(val);
      } else {
        console.log("sceditor.js:7359 - sceditor.setValue('"+val+"',filter) is WYSIWYG MODE");
        base.setSourceEditorValue(val);
      }
    } else {
      console.warn("sceditor.js:7362 - val was not defined");
    }

  }

  base.getValueHTML = function (filter) {
    var val = base.getValue(filter);
    console.log("sceditor.js:7352 - sceditor.getValueHTML(filter)='"+val+"'");
    if ('toHtml' in format) {
      val = format.toHtml(val);
    } else {
    }
    return val;
  }

  base.setValueHTML = function (val, filter) {
    
    console.log("sceditor.js:7352 - sceditor.setValueHTML('"+val+"',filter)");
    base.setWysiwygEditorValue(val,filter);
  }

  base.getTree = function (filter) {
    var source = base.getValue(filter);
    var tokentree = null;
    if (format) {
      if (format.toTree) {
        tokentree = format.toTree(source);
      }
    } else {
    }
    return tokentree;
  }

  base.setTree = function (tokentree,filter) {
    var source = base.getValue(filter);
    var tokentree = null;
    if (format) {
      if (format.fromTree) {
        var html = format.fromTree(tokentree);
        base.setWysiwygEditorValue(html,filter);
      }
    } else {
    }
    return tokentree;
  }

  base.val = function (val, filter) {
    if (val) {
      console.log("sceditor.js:7336 - sceditor.val('"+val+"',filter)");
      if (!isString(val)) {
        val = "  ";
      }
      if (val == "[object Object]") {
        val = " ";
      }
      if (!base.inSourceMode()) {
        console.log("sceditor.js:7336 - sceditor.val('"+val+"',filter) is SOURCE MODE");
        if (filter !== false && 'toHtml' in format) {
          val = format.toHtml(val);
        }

        base.setWysiwygEditorValue(val);
      } else {
        console.log("sceditor.js:7336 - sceditor.val('"+val+"',filter) is WYSIWYG MODE");
        base.setSourceEditorValue(val);
      }
    } else {
      console.warn("sceditor.js:7358 val was not defined");
      return base.getValue();

    }

    return base;
  };

  base.setMathMenu = function (pMathCmds) {
    
    if (pMathCmds) {
      initMathToolBar(pMathCmds);
      
    }
  }

  base.getMathCommands = function () {
    
    if (base.mathcommands) {
      return base.mathcommands;
    } else {
      return {};
    };
  }

  base.insert = function (
    start, end, filter, convertEmoticons, allowMixed
  ) {
    if (base.inSourceMode()) {
      base.sourceEditorInsertText(start, end);
      return base;
    }

    if (end) {
      var	html = rangeHelper.selectedHtml();

      if (filter !== false && 'fragmentToSource' in format) {
        html = format
          .fragmentToSource(html, wysiwygDocument, currentNode);
      }

      start += html + end;
    }
    
    if (filter !== false && 'fragmentToHtml' in format) {
      start = format.fragmentToHtml(start, currentNode);
    }

    if (filter !== false && allowMixed === true) {
      start = start.replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
    }

    base.wysiwygEditorInsertHtml(start);

    return base;
  };

  base.getHTMLEditorValue = function () {
    var	html;

    var tmp = createElement('div', {}, wysiwygDocument);
    var childNodes = wysiwygBody.childNodes;

    for (var i = 0; i < childNodes.length; i++) {
      appendChild(tmp, childNodes[i].cloneNode(true));
    }

    appendChild(wysiwygBody, tmp);
    fixNesting(tmp);
    html = tmp.innerHTML;
    remove(tmp);
    return html;
  }
  
  base.getWysiwygEditorValue = function (filter) {
    var	html = base.getHTMLEditorValue();
    
    if (filter !== false && format.hasOwnProperty('toSource')) {
      html = format.toSource(html, wysiwygDocument);
    }

    return html;
  };

  base.getBody = function () {
    return wysiwygBody;
  };

  base.getContentAreaContainer = function () {
    return wysiwygEditor;
  };

  base.getSourceEditorValue = function (filter) {
    var val = sourceEditor.value;
    console.log("sceditor.js:7811 - Source Code Editor Value val='"+val+"'");
    if (filter !== false && 'toHtml' in format) {
      val = format.toHtml(val);
    }
    console.log("sceditor.js:7811 - Source Code Editor Value val(HTML-Filter)='"+val+"'");

    return val;
  };

  function drawMath4ID(pID,str) {
      var math = MathJax.Hub.getAllJax(pID)[0];
      if (math) {
        
        MathJax.Hub.Queue([ "Text", math, str ]);

      }
  }

  function getMathEditorValue() {
    var ret = " ";
    
    if (mathEditorMode == "wysiwyg") {
      if (mathquillDOM && mathquillWYSIWYG) {
          ret = mathquillWYSIWYG.latex()
      } else {
        if (window.ace) {
          ret = mathaceEditor.getValue();
        } else {
          ret = mathjaxEditor.value;
        }
      }
    } else {
      ret = mathjaxEditor.value;
    }
    return ret;
  }

  function setMathEditorValue(mathexpr,display) {
    
    if(mathexpr) {
      
      mathexpr = mathexpr.replace(/^[\n\s]+/g,"");
      
      mathexpr = mathexpr.replace(/&amp;/g,"&");
    };
    
    if (mathquillDOM && mathquillWYSIWYG) {
      mathquillWYSIWYG.latex(mathexpr)
    } else {
      if (window.ace) {
        mathaceEditor.setValue(mathexpr);
      } else {
        mathjaxEditor.value = mathexpr;
      }
    }
    if (display) {
      mathjaxDisplay.value = display;
    }
  }

  function  renderMathEditorPreview(texstr) {
    texstr = texstr || " ";
    if (window.MathQuill) {
      console.log("MathQuill: renderMathEditorPreview('"+texstr+"')");
      mathjaxPreview.innerHTML = "";
      var mathSpan = createElement("span");
      mathSpan.innerHTML = texstr;
      appendChild(mathjaxPreview,mathSpan);
      var MQ = MathQuill.getInterface(1);
      
      var mathField = MQ.StaticMath(mathSpan);
      
    } else if (window.MathJax) {
      console.log("sceditor.js:8980 - MathJax: renderMathEditorPreview('"+texstr+"')");
      var vMJ = "\\( \\displaystyle " + texstr + "\\)";;
      if (mathjaxDisplay) {
        if (mathjaxDisplay.value == "inline") {
          vMJ =  "\\( \\displaystyle " + texstr + "\\)";
        }
      } else {
        console.warn("CALL: renderMathEditorPreview(texstr) - mathjaxDisplay is not defined");
      }
      setMathBlockInline();
      mathjaxPreview.innerHTML = vMJ;
      MathJax.Hub.Typeset(); 
      
    } else {
      console.warn("window.MathQuill and window.MathJax are not defined for '"+texstr+"'")
    }
  }

  function renderMathEditor (e) {

    var texstr = getMathEditorValue(); 
    renderMathEditorPreview(texstr);
  };

  function updateMath4Editor(id4dom,mathexpr,mathdisplay) {

    mathdisplay = mathdisplay || "inline";
    var editnode = wysiwygDocument.getElementById(id4dom);
    if (!editnode) {
      console.error("Mathematical expression in editor with id='"+id4dom+"' does not exist! No update of mathematical expression '"+mathexpr+"'");
    } else {

      var mathnode;
      if (mathdisplay == "block") {
        
        mathnode = createElement("div");
      } else {
        
        mathnode = createElement("span",wysiwygDocument);
      }
      
      addClass(mathnode,"math"+mathdisplay);
      mathnode.innerHTML = mathexpr;
      editnode.parentNode.insertBefore(mathnode,editnode);

      editnode.parentNode.removeChild(editnode);

      renderSingleMathTag(mathnode,mathdisplay);
    }
    if (mathdisplay == "block") {
    } else {
    }

    var mathdel = wysiwygDocument.querySelectorAll("span.MathJax_Preview");
    if (mathdel) {
      if (mathdel.length > 0) {
        for (var i = 0; i < mathdel.length; ++i) {
          mathdel[i].parentNode.removeChild(mathdel[i]);
        }
      }
    }
    var mathmenudel = mathtoolbar.querySelectorAll("span.MathJax_Preview");
    if (mathmenudel.length > 0) {
      for (var j = 0; j < mathmenudel.length; ++j) {
        mathmenudel[j].parentNode.removeChild(mathmenudel[j]);
      }
    }
  }

  base.mathquill2display = function(texstring, previewnode, editornode, mathdisplay, staticmath) {
    var editor = this;
    mathdisplay = mathdisplay || "inline";
    staticmath = staticmath || "edit"; 
    if (window.MathQuill) {
      if  (window.jQuery) {
        var previewSpan = createElement("span");
        var editSpan = createElement("span",wysiswygDocument);
        if (staticmath == "edit") {
          setMathEditorValue(texstring,mathdisplay);
        } else {
          
        }
        mathjaxEditor.value = texstring;
        
      }
    } else {
      console.warn("MathQuill is missing please import MathQuill in your project");
    }

  }

  base.mathjax2svg = function(texstring, previewnode, editornode, mathdisplay) {
    var editor = this;
    mathdisplay = mathdisplay || "inline";
    
    if (window.MathJax) {
      var wrapper;

      var mathstr = texstring;
      if (texstring) {
        texstring = "\\( \\displaystyle "+ texstring +"\\)";
      }
      wrapper = previewnode;
      wrapper.setAttribute("latex",mathstr);
      wrapper.innerHTML = texstring;
      editornode.innerHTML = "";

      MathJax.Hub.Queue(["Typeset", MathJax.Hub, wrapper]);
      MathJax.Hub.Queue(function() {

        if (mathdisplay == "block") {
          
          wrapper.setAttribute("mathdisplay","block");
          wrapper.style.cssText = "text-align: center";
          editornode.style.cssText = "text-align: center";
          
        } else {
          
          wrapper.setAttribute("mathdisplay","inline");

        }
        
        var source4math = wrapper.getElementsByTagName('script')[0];
        if (source4math)  {
          remove(source4math);
        }
        var ariahidden = wrapper.querySelectorAll('[aria-hidden="true"]');
        for (var i = 0; i < ariahidden.length; i++) {
          remove(ariahidden[i]);
          
        }

        var mathjax_out = wrapper.innerHTML;
        if (mathjax_out) {

          var id4math=get_unique_id("MATH4")
          editornode.setAttribute("id",id4math);
          var linkatts = {
            "href":"#",
            "id4math":id4math
          };
          
          var link4mathedit = createElement('a', linkatts, wysiwygDocument);
          addClass(link4mathedit,"link4mathedit");
          link4mathedit.setAttribute("latex", mathstr);
          var b = base;
          link4mathedit.addEventListener("click", function (e) {
            var display = "inline";
            if (hasClass(link4mathedit.parentNode, "mathblock")) {
              display = "block";
            }
            mathjaxID4DOM.value = id4math;
            setMathEditorValue(mathstr,display);

            b.showMathEditor();
          });
          
          link4mathedit.innerHTML = wrapper.innerHTML;

          removeChildren4Tag(link4mathedit,"svg");
          editornode.appendChild(link4mathedit);
        };
      });
    } else {
        console.error("MathJax is not loaded - please import MathJax library in your main HTML");
    }
  }

  base.mathjax2img = function(texstring, el) {
    if (window.MathJax) {
      var input = texstring;
      var wrapper = document.createElement("div");
      wrapper.innerHTML = input;
      var output = { svg: "", dataurl:"", png: ""};
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, wrapper]);
      MathJax.Hub.Queue(function() {
        var mathjax_out = wrapper.getElementsByTagName("svg")[0];
        
        if (mathjax_out) {

          alert("SVG2IMG: '" + input + "'");
          var image = new Image();
          output.dataurl = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(output.svg)));
          image.src = output.dataurl;
          image.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            alert("Canvas: '"+input +"' width="+canvas.width+" height="+canvas.height);
            var context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            var ifImage = new Image();
            ifImage.src = canvas.toDataURL('image/png');
            window.open(canvas.toDataURL('image/png'));
            if (el) {
              alert("Append iFrame image for '"+input+"'");
              el.appendChild(ifImage);
            } else {
            }
          }
        } else {
            console.error("MathJax does not render in SVG - change config parameter of MathJax to 'TeX-AMS_SVG'");
        };
      });
    } else {
      console.error("MathJax is not loaded - please import MathJax library in your main HTML");
    }
  }

  base.mathjax2callback = function(texstring, callback) {
    if (window.MathJax) {
      var input = texstring;
      var wrapper = document.createElement("div");
      wrapper.innerHTML = input;
      var output = { svg: "", dataurl:"", png: ""};
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, wrapper]);
      MathJax.Hub.Queue(function() {
        var mathjax_out = wrapper.getElementsByTagName("svg")[0];
        if (mathjax_out) {
          mathjax_out.setAttribute("xmlns", "http:/'+ '/www.w3.org/2000/svg");
          output.svg = mathjax_out.outerHTML;
          alert("SVG: '"+output.svg+"'");
          if (el) {
            
            el.innerHTML += output.svg;
          }
          var image = new Image();
          output.dataurl = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(output.svg)));
          image.src = output.dataurl;
          image.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            var context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            output.png = canvas.toDataURL('image/png');
            if (callback && ( isFunction(callback) )) {
                callback(output);
            } else {
            }
          }
          el.appendChild(image);
        } else {
            console.error("MathJax does not render in SVG - change config parameter of MathJax to 'TeX-AMS_SVG'");
        };
      });
    } else {
      console.error("MathJax is not loaded - please import MathJax library in your main HTML");
    }
  }

  function getMathEditorNode(id4math,mathdisplay) {
    alert('getMathEditorNode("'+id4math+'","'+mathdisplay+'")');
  }
  
  function renderSingleMathTag(mathtag,mathdisplay) {
    mathdisplay = mathdisplay || "inline";
    
    var str = mathtag.innerHTML;
    
    var id4dom = get_unique_id("RENDER4"+mathdisplay.toUpperCase());
    
    var renderDiv = createElement("div");
    renderDiv.setAttribute("id",id4dom);
    appendChild(editorRender,renderDiv);
    if (window.MathJax) {
      base.mathjax2svg(str,renderDiv,mathtag,mathdisplay); 
    } else if (window.MathQuill)  {
      base.mathquill2display(str,renderDiv,mathtag,mathdisplay);
    }
    
  }

  base.renderMathTags = function () {
    if (wysiwygBody) {

      var math4inline = wysiwygBody.getElementsByClassName("mathinline");
      var math4block  = wysiwygBody.getElementsByClassName("mathblock");

      editorRender.innerHTML = "";
      var str,id4dom;
      
      for(var j = 0; j < math4block.length; j++) {
          renderSingleMathTag(math4block[j],"block");
          
      }
      for(var i = 0; i < math4inline.length; i++) {
          renderSingleMathTag(math4inline[i],"inline");
          
      }
    } else {
    }
    MathJax.Hub.Typeset();
  }

  function renderSingleLinkTag(node,type4link,doc) {
    var link = node.getAttribute("href");
    if (link) {
      
      node.setAttribute("href4link",link);
      
      node.setAttribute("href","#");
      switch (type4link) {
        case "EXTLINK":
          
          node.addEventListener("click",function () {
            
            var newURL = prompt('URL (EXT):', (this.getAttribute("href4link") || ""));
            if (newURL) {
              this.setAttribute("href4link",newURL)
            }
          });
        break;
        case "INTLINK":
          node.addEventListener("click",function () {
            
            var oldIntLink = this.getAttribute("link");
            var path = this.getAttribute("path");
            var newURL = prompt('URL (INT): '+path, (this.getAttribute("link") || ""));
            if (newURL) {
              this.setAttribute("link",newURL);
              var display_url = path + newURL;
              var old_display_url = this.getAttribute("href4link");
              alert("display_url="+display_url+"\nold_display_url="+old_display_url);
              this.setAttribute("href4link",display_url);
            }
          });

        break;
        default:

      }
    }
  }

  base.renderLinkTags = function (doc) {
    if (wysiwygBody) {
      var link4ext = wysiwygBody.querySelectorAll('[type4link="EXTLINK"]');
      var link4int = wysiwygBody.querySelectorAll('[type4link="INTLINK"]');
      for(var j = 0; j < link4ext.length; j++) {
          renderSingleLinkTag(link4ext[j],"EXTLINK",doc);
      }
      for(var i = 0; i < link4int.length; i++) {
          renderSingleLinkTag(link4int[i],"INTLINK",doc);
      }
    }
  }

  base.setWysiwygEditorValue = function (value) {
    if (!value) {
      value = '<p><br /></p>';
    }
    value = sanitize(value);
    wysiwygBody.innerHTML = value;
    replaceEmoticons();

    appendNewLine();
    triggerValueChanged();
    autoExpand();
    
    if (window.MathJax || window.MathQuill) {
      base.renderMathTags();
      
    } else {
    }
    base.renderLinkTags();
  };

  base.setSourceEditorValue = function (value) {
    sourceEditor.value = value;

    triggerValueChanged();
  };

  base.updateOriginal = function () {
    original.value = base.val();
  };

  replaceEmoticons = function () {
    if (options.emoticonsEnabled) {
      replace(wysiwygBody, allEmoticons, options.emoticonsCompat);
    }
  };

  base.inSourceMode = function () {
    return hasClass(editorContainer, 'sourceMode');
  };

  base.inMathMode = function () {

    return (mathEditorMode !== "closed");
  };

  base.sourceMode = function (enable) {
    var inSourceMode = base.inSourceMode();

    if (typeof enable !== 'boolean') {
      return inSourceMode;
    }

    if ((inSourceMode && !enable) || (!inSourceMode && enable)) {
      base.toggleSourceMode();
    }

    return base;
  };

  base.toggleMathMode = function () {
    var val;

    console.log("base.toggleMathMode('"+mathEditorMode+"')");
    var isInSourceMode = base.inSourceMode();
    var isInMathMode = base.inMathMode();
    
    if (isInMathMode) {
      
      if (editorMode == "source") {
        
        val = base.getSourceEditorValue();
        
        base.setSourceEditorValue(val);
        show(sourceEditor);
        console.log("base.toggleMathMode(sourceEditor) val='"+val+"'")

      } else {

        val = base.getWysiwygEditorValue();
        
        base.setWysiwygEditorValue(val);
        show(wysiwygEditor);
        console.log("base.toggleMathMode(wysiwygEditor) val='"+val+"'");
      }
      hide(mathjaxContainer);
      mathEditorMode = "closed";
    } else {
      show(mathjaxContainer);
      if (isInSourceMode) {
        editorMode = "source";
        hide(sourceEditor);
      } else {
        editorMode = "wysiwyg";
        hide(wysiwygEditor);
      }
    }
    
    mathjaxContainer.setAttribute('editorMode', editorMode);
  };

  base.toggleSourceMode = function () {
    var isInSourceMode = base.inSourceMode();
    var val = "undefined editor string";

    if (!isWysiwygSupported && isInSourceMode) {
      return;
    }
    
    if (!isInSourceMode) {
      
      rangeHelper.saveRange();
      rangeHelper.clear();
    }

    currentSelection = null;
    base.blur();

    if (isInSourceMode) {
      
      editorMode = "wysiwyg";
      val = base.getSourceEditorValue();
      base.setWysiwygEditorValue(val);

    } else {
      
      editorMode = "source";
      val = base.getWysiwygEditorValue();
      base.setSourceEditorValue(val);
    }
    
    toggle(sourceEditor);
    
    toggle(wysiwygEditor);

    toggleClass(editorContainer, 'wysiwygMode', isInSourceMode);
    toggleClass(editorContainer, 'sourceMode', !isInSourceMode);

    updateToolBar();
    updateActiveButtons();
  };

  function setMathBlockInline () {
    if (mathjaxDisplay && mathjaxDisplay.value == "block") {
      mathjaxPreview.style.cssText = "text-align: center";
    } else {
      mathjaxPreview.style.cssText = "text-align: left;margin-left: 10px";
  }
}

  base.showMathEditor = function () {

    setMathBlockInline();
    show(mathjaxContainer);
    if (window.MathQuill) {
      show(mathquillEditor);
      mathEditorMode = "wysiwyg";
      hide(mathjaxPreview);
      hide(mathjaxEditor);
      console.log("MathQuill display '"+mathEditorMode+"'");
    } else {
      
      show(mathjaxPreview);
      hide(mathquillEditor);
      mathEditorMode = "source";
      show(mathjaxEditor);
      console.log("MathJax display '"+mathEditorMode+"'");
    }
    hide(wysiwygEditor);
    
    setTimeout(renderMathEditor,200);
  }

  base.closeMathEditor = function () {
    hide(mathjaxContainer);
    show(wysiwygEditor);

  }

  base.getName4Format = function () {
    var vFormat = options.format || "xhtml";
    return vFormat;
  };

  sourceEditorSelectedText = function () {
    sourceEditor.focus();

    return sourceEditor.value.substring(
      sourceEditor.selectionStart,
      sourceEditor.selectionEnd
    );
  };

  var handleMathCommand = function (caller, cmd) {
    
    var ins  = " "+cmd.latex.trim()+ " ";
    var out = ins;
    
    if (mathEditorMode == "wysiwyg") {
      if (mathquillDOM && mathquillWYSIWYG) {
          out = mathquillWYSIWYG.latex()+ ins;
          
      } else {
        if (window.ace) {
          mathaceEditor.session.insert(mathaceEditor.getCursorPosition(), out);
          out = mathaceEditor.getValue();
        } else {
          
          base.insertTextAtCursor(mathjaxEditor,out)
          out = mathjaxEditor.value;
        }
      }
    } else {
      
      base.insertTextAtCursor(mathjaxEditor,ins)
      out = mathjaxEditor.value;
    }
    renderMathEditorPreview(out);
  }

  handleCommand = function (caller, cmd) {
    
    console.log("sceditor.js:7731 - cmd="+JSON.stringify(cmd,null,4)+" ");
    if (base.inSourceMode()) {
      console.log("sceditor.js:7733 - inSourceMode() cmd="+JSON.stringify(cmd,null,4)+" ");

      if (cmd.txtExec) {
        if (Array.isArray(cmd.txtExec)) {
          base.sourceEditorInsertText.apply(base, cmd.txtExec);
        } else {
          cmd.txtExec.call(base, caller, sourceEditorSelectedText());
        }
      }
    } else if (cmd.exec) {
      console.log("sceditor.js:7733 - cmd.exec() defined cmd="+JSON.stringify(cmd,null,4)+" ");
      if (isFunction(cmd.exec)) {
        console.log("sceditor.js:7745 - cmd.exec() is a function - defined cmd="+JSON.stringify(cmd,null,4)+" ");
        cmd.exec.call(base, caller);
      } else {
        console.log("sceditor.js:7747 - cmd.exec='"+cmd.exec+"' defined cmd="+JSON.stringify(cmd,null,4)+" ");
        base.execCommand(
          cmd.exec,
          cmd.hasOwnProperty('execParam') ? cmd.execParam : null
        );
      }
    }

  };

  base.execCommand = function (command, param) {
    console.log("sceditor.js:8011 - command='"+command+"' defined param="+JSON.stringify(param,null,4)+" ");
    var	executed    = false,
    commandObj  = base.commands[command];
    
    base.focus();

    if (closest(rangeHelper.parentNode(), 'code')) {
      return;
    }

    try {
      console.log("sceditor.js:8007 - execCommand('"+command+"')")
      executed = wysiwygDocument.execCommand(command, false, param);
    } catch (ex) { }

    if (!executed && commandObj && commandObj.errorMessage) {
      
      alert(base._(commandObj.errorMessage));
    }

    updateActiveButtons();
  };

  checkSelectionChanged = function () {
    function check() {

      if (wysiwygWindow.getSelection() &&
        wysiwygWindow.getSelection().rangeCount <= 0) {
        currentSelection = null;

      } else if (rangeHelper && !rangeHelper.compare(currentSelection)) {
        currentSelection = rangeHelper.cloneSelected();

        if (currentSelection && currentSelection.collapsed) {
          var parent = currentSelection.startContainer;
          var offset = currentSelection.startOffset;

          if (offset && parent.nodeType !== TEXT_NODE) {
            parent = parent.childNodes[offset];
          }

          while (parent && parent.parentNode !== wysiwygBody) {
            parent = parent.parentNode;
          }

          if (parent && isInline(parent, true)) {
            rangeHelper.saveRange();
            wrapInlines(wysiwygBody, wysiwygDocument);
            rangeHelper.restoreRange();
          }
        }

        trigger(editorContainer, 'selectionchanged');
      }

      isSelectionCheckPending = false;
    }

    if (isSelectionCheckPending) {
      return;
    }

    isSelectionCheckPending = true;

    if ('onselectionchange' in wysiwygDocument) {
      check();
    } else {
      setTimeout(check, 100);
    }
  };

  checkNodeChanged = function () {
    
    var	oldNode,
      node = rangeHelper.parentNode();

    if (currentNode !== node) {
      oldNode          = currentNode;
      currentNode      = node;
      currentBlockNode = rangeHelper.getFirstBlockParent(node);

      trigger(editorContainer, 'nodechanged', {
        oldNode: oldNode,
        newNode: currentNode
      });
    }
  };

  base.currentNode = function () {
    return currentNode;
  };

  base.currentBlockNode = function () {
    return currentBlockNode;
  };

  updateActiveButtons = function () {
    var firstBlock, parent;
    var activeClass = 'active';
    var doc         = wysiwygDocument;
    var isSource    = base.sourceMode();

    if (base.readOnly()) {
      each(find(toolbar, activeClass), function (_, menuItem) {
        removeClass(menuItem, activeClass);
      });
      return;
    }

    if (!isSource) {
      parent     = rangeHelper.parentNode();
      firstBlock = rangeHelper.getFirstBlockParent(parent);
    }

    for (var j = 0; j < btnStateHandlers.length; j++) {
      var state      = 0;
      var btn        = toolbarButtons[btnStateHandlers[j].name];
      var stateFn    = btnStateHandlers[j].state;
      var isDisabled = (isSource && !btn._sceTxtMode) ||
            (!isSource && !btn._sceWysiwygMode);

      if (isString(stateFn)) {
        if (!isSource) {
          try {
            state = doc.queryCommandEnabled(stateFn) ? 0 : -1;

            if (state > -1) {
              state = doc.queryCommandState(stateFn) ? 1 : 0;
            }
          } catch (ex) {}
        }
      } else if (!isDisabled) {
        state = stateFn.call(base, parent, firstBlock);
      }

      toggleClass(btn, 'disabled', isDisabled || state < 0);
      toggleClass(btn, activeClass, state > 0);
    }

    if (icons && icons.update) {
      icons.update(isSource, parent, firstBlock);
    }
  };

  handleKeyPress = function (e) {
    
    if (e.defaultPrevented) {
      return;
    }

    base.closeDropDown();

    if (e.which === 13) {
      var LIST_TAGS = 'li,ul,ol';

      if (!is(currentBlockNode, LIST_TAGS) &&
        hasStyling(currentBlockNode)) {

        var br = createElement('br', {}, wysiwygDocument);
        rangeHelper.insertNode(br);

        var parent  = br.parentNode;
        var lastChild = parent.lastChild;

        if (lastChild && lastChild.nodeType === TEXT_NODE &&
          lastChild.nodeValue === '') {
          remove(lastChild);
          lastChild = parent.lastChild;
        }

        if (!isInline(parent, true) && lastChild === br &&
          isInline(br.previousSibling)) {
          rangeHelper.insertHTML('<br>');
        }

        e.preventDefault();
      }
    }
  };

  appendNewLine = function () {

    rTraverse(wysiwygBody, function (node) {
      
      if (node.nodeType === ELEMENT_NODE &&
        !/inline/.test(css(node, 'display'))) {

        if (!is(node, '.sceditor-nlf') && hasStyling(node)) {
          var paragraph = createElement('p', {}, wysiwygDocument);
          paragraph.className = 'sceditor-nlf';
          paragraph.innerHTML = '<br />';
          appendChild(wysiwygBody, paragraph);
          return false;
        }
      }

      if ((node.nodeType === 3 && !/^\s*$/.test(node.nodeValue)) ||
        is(node, 'br')) {
        return false;
      }
    });
  };

  handleFormReset = function () {
    base.val(original.value);
  };

  handleMouseDown = function () {
    base.closeDropDown();
  };

  base._ = function () {
    var	undef,
      args = arguments;

    if (locale && locale[args[0]]) {
      args[0] = locale[args[0]];
    }

    return args[0].replace(/\{(\d+)\}/g, function (str, p1) {
      return args[p1 - 0 + 1] !== undef ?
        args[p1 - 0 + 1] :
        '{' + p1 + '}';
    });
  };

  handleEvent = function (e) {
    if (pluginManager) {
      
      pluginManager.call(e.type + 'Event', e, base);
    }

    var name = (e.target === sourceEditor ? 'scesrc' : 'scewys') + e.type;

    if (eventHandlers[name]) {
      eventHandlers[name].forEach(function (fn) {
        fn.call(base, e);
      });
    }
  };

  base.bind = function (events, handler, excludeWysiwyg, excludeSource) {
    events = events.split(' ');

    var i  = events.length;
    while (i--) {
      if (isFunction(handler)) {
        var wysEvent = 'scewys' + events[i];
        var srcEvent = 'scesrc' + events[i];

        if (!excludeWysiwyg) {
          eventHandlers[wysEvent] = eventHandlers[wysEvent] || [];
          eventHandlers[wysEvent].push(handler);
        }

        if (!excludeSource) {
          eventHandlers[srcEvent] = eventHandlers[srcEvent] || [];
          eventHandlers[srcEvent].push(handler);
        }

        if (events[i] === 'valuechanged') {
          triggerValueChanged.hasHandler = true;
        }
      }
    }

    return base;
  };

  base.unbind = function (events, handler, excludeWysiwyg, excludeSource) {
    events = events.split(' ');

    var i  = events.length;
    while (i--) {
      if (isFunction(handler)) {
        if (!excludeWysiwyg) {
          arrayRemove(
            eventHandlers['scewys' + events[i]] || [], handler);
        }

        if (!excludeSource) {
          arrayRemove(
            eventHandlers['scesrc' + events[i]] || [], handler);
        }
      }
    }

    return base;
  };

  base.blur = function (handler, excludeWysiwyg, excludeSource) {
    if (isFunction(handler)) {
      base.bind('blur', handler, excludeWysiwyg, excludeSource);
    } else if (!base.sourceMode()) {
      wysiwygBody.blur();
    } else {
      sourceEditor.blur();
    }

    return base;
  };

  base.focus = function (handler, excludeWysiwyg, excludeSource) {
    if (isFunction(handler)) {
      
      base.bind('focus', handler, excludeWysiwyg, excludeSource);
    } else if (!base.inSourceMode()) {

      if (find(wysiwygDocument, ':focus').length) {
        return;
      }

      var container;
      var rng = rangeHelper.selectedRange();

      if (!currentSelection) {
        autofocus(true);
      }

      if (rng && rng.endOffset === 1 && rng.collapsed) {
        container = rng.endContainer;

        if (container && container.childNodes.length === 1 &&
          is(container.firstChild, 'br')) {
          rng.setStartBefore(container.firstChild);
          rng.collapse(true);
          rangeHelper.selectRange(rng);
        }
      }

      wysiwygWindow.focus();
      wysiwygBody.focus();
    } else {
      sourceEditor.focus();
    }

    updateActiveButtons();

    return base;
  };

  base.keyDown = function (handler, excludeWysiwyg, excludeSource) {
    return base.bind('keydown', handler, excludeWysiwyg, excludeSource);
  };

  base.keyPress = function (handler, excludeWysiwyg, excludeSource) {
    return base
      .bind('keypress', handler, excludeWysiwyg, excludeSource);
  };

  base.keyUp = function (handler, excludeWysiwyg, excludeSource) {
    return base.bind('keyup', handler, excludeWysiwyg, excludeSource);
  };

  base.nodeChanged = function (handler) {
    return base.bind('nodechanged', handler, false, true);
  };

  base.selectionChanged = function (handler) {
    return base.bind('selectionchanged', handler, false, true);
  };

  base.valueChanged = function (handler, excludeWysiwyg, excludeSource) {
    return base
      .bind('valuechanged', handler, excludeWysiwyg, excludeSource);
  };

  emoticonsKeyPress = function (e) {
    var	replacedEmoticon,
      cachePos       = 0,
      emoticonsCache = base.emoticonsCache,
      curChar        = String.fromCharCode(e.which);

    if (closest(currentBlockNode, 'code')) {
      return;
    }

    if (!emoticonsCache) {
      emoticonsCache = [];

      each(allEmoticons, function (key, html) {
        emoticonsCache[cachePos++] = [key, html];
      });

      emoticonsCache.sort(function (a, b) {
        return a[0].length - b[0].length;
      });

      base.emoticonsCache = emoticonsCache;
      base.longestEmoticonCode =
        emoticonsCache[emoticonsCache.length - 1][0].length;
    }

    replacedEmoticon = rangeHelper.replaceKeyword(
      base.emoticonsCache,
      true,
      true,
      base.longestEmoticonCode,
      options.emoticonsCompat,
      curChar
    );

    if (replacedEmoticon) {
      if (!options.emoticonsCompat || !/^\s$/.test(curChar)) {
        e.preventDefault();
      }
    }
  };

  emoticonsCheckWhitespace = function () {
    checkWhitespace(currentBlockNode, rangeHelper);
  };

  base.emoticons = function (enable) {
    if (!enable && enable !== false) {
      return options.emoticonsEnabled;
    }

    options.emoticonsEnabled = enable;

    if (enable) {
      on(wysiwygBody, 'keypress', emoticonsKeyPress);

      if (!base.sourceMode()) {
        rangeHelper.saveRange();

        replaceEmoticons();
        triggerValueChanged(false);

        rangeHelper.restoreRange();
      }
    } else {
      var emoticons =
        find(wysiwygBody, 'img[data-sceditor-emoticon]');

      each(emoticons, function (_, img) {
        var text = data(img, 'sceditor-emoticon');
        var textNode = wysiwygDocument.createTextNode(text);
        img.parentNode.replaceChild(textNode, img);
      });

      off(wysiwygBody, 'keypress', emoticonsKeyPress);

      triggerValueChanged();
    }

    return base;
  };

  base.css = function (css) {
    if (!inlineCss) {
      inlineCss = createElement('style', {
        id: 'inline'
      }, wysiwygDocument);

      appendChild(wysiwygDocument.head, inlineCss);
    }

    if (!isString(css)) {
      return inlineCss.styleSheet ?
        inlineCss.styleSheet.cssText : inlineCss.innerHTML;
    }

    if (inlineCss.styleSheet) {
      inlineCss.styleSheet.cssText = css;
    } else {
      inlineCss.innerHTML = css;
    }

    return base;
  };

  handleKeyDown = function (e) {
    var	shortcut   = [],
      SHIFT_KEYS = {
        '`': '~',
        '1': '!',
        '2': '@',
        '3': '#',
        '4': '$',
        '5': '%',
        '6': '^',
        '7': '&',
        '8': '*',
        '9': '(',
        '0': ')',
        '-': '_',
        '=': '+',
        ';': ': ',
        '\'': '"',
        ',': '<',
        '.': '>',
        '/': '?',
        '\\': '|',
        '[': '{',
        ']': '}'
      },
      SPECIAL_KEYS = {
        8: 'backspace',
        9: 'tab',
        13: 'enter',
        19: 'pause',
        20: 'capslock',
        27: 'esc',
        32: 'space',
        33: 'pageup',
        34: 'pagedown',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        45: 'insert',
        46: 'del',
        91: 'win',
        92: 'win',
        93: 'select',
        96: '0',
        97: '1',
        98: '2',
        99: '3',
        100: '4',
        101: '5',
        102: '6',
        103: '7',
        104: '8',
        105: '9',
        106: '*',
        107: '+',
        109: '-',
        110: '.',
        111: '/',
        112: 'f1',
        113: 'f2',
        114: 'f3',
        115: 'f4',
        116: 'f5',
        117: 'f6',
        118: 'f7',
        119: 'f8',
        120: 'f9',
        121: 'f10',
        122: 'f11',
        123: 'f12',
        144: 'numlock',
        145: 'scrolllock',
        186: ';',
        187: '=',
        188: ',',
        189: '-',
        190: '.',
        191: '/',
        192: '`',
        219: '[',
        220: '\\',
        221: ']',
        222: '\''
      },
      NUMPAD_SHIFT_KEYS = {
        109: '-',
        110: 'del',
        111: '/',
        96: '0',
        97: '1',
        98: '2',
        99: '3',
        100: '4',
        101: '5',
        102: '6',
        103: '7',
        104: '8',
        105: '9'
      },
      which     = e.which,
      character = SPECIAL_KEYS[which] ||
        String.fromCharCode(which).toLowerCase();

    if (e.ctrlKey || e.metaKey) {
      shortcut.push('ctrl');
    }

    if (e.altKey) {
      shortcut.push('alt');
    }

    if (e.shiftKey) {
      shortcut.push('shift');

      if (NUMPAD_SHIFT_KEYS[which]) {
        character = NUMPAD_SHIFT_KEYS[which];
      } else if (SHIFT_KEYS[character]) {
        character = SHIFT_KEYS[character];
      }
    }

    if (character && (which < 16 || which > 18)) {
      shortcut.push(character);
    }

    shortcut = shortcut.join('+');
    if (shortcutHandlers[shortcut] &&
      shortcutHandlers[shortcut].call(base) === false) {

      e.stopPropagation();
      e.preventDefault();
    }
  };

  base.addShortcut = function (shortcut, cmd) {
    shortcut = shortcut.toLowerCase();

    if (isString(cmd)) {
      shortcutHandlers[shortcut] = function () {
        handleCommand(toolbarButtons[cmd], base.commands[cmd]);

        return false;
      };
    } else {
      shortcutHandlers[shortcut] = cmd;
    }

    return base;
  };

  base.removeShortcut = function (shortcut) {
    delete shortcutHandlers[shortcut.toLowerCase()];

    return base;
  };

  handleBackSpace = function (e) {
    var	node, offset, range, parent;

    if (options.disableBlockRemove || e.which !== 8 ||
      !(range = rangeHelper.selectedRange())) {
      return;
    }

    node   = range.startContainer;
    offset = range.startOffset;

    if (offset !== 0 || !(parent = currentStyledBlockNode()) ||
      is(parent, 'body')) {
      return;
    }

    while (node !== parent) {
      while (node.previousSibling) {
        node = node.previousSibling;

        if (node.nodeType !== TEXT_NODE || node.nodeValue) {
          return;
        }
      }

      if (!(node = node.parentNode)) {
        return;
      }
    }

    base.clearBlockFormatting(parent);
    e.preventDefault();
  };

  currentStyledBlockNode = function () {
    var block = currentBlockNode;

    while (!hasStyling(block) || isInline(block, true)) {
      if (!(block = block.parentNode) || is(block, 'body')) {
        return;
      }
    }

    return block;
  };

  base.clearBlockFormatting = function (block) {
    block = block || currentStyledBlockNode();

    if (!block || is(block, 'body')) {
      return base;
    }

    rangeHelper.saveRange();

    block.className = '';

    attr(block, 'style', '');

    if (!is(block, 'p,div,td')) {
      convertElement(block, 'p');
    }

    rangeHelper.restoreRange();
    return base;
  };

  triggerValueChanged = function (saveRange) {
    if (!pluginManager ||
      (!pluginManager.hasHandler('valuechangedEvent') &&
        !triggerValueChanged.hasHandler)) {
      return;
    }

    var	currentHtml,
      sourceMode   = base.sourceMode(),
      hasSelection = !sourceMode && rangeHelper.hasSelection();

    isComposing = false;

    saveRange = saveRange !== false &&
      !wysiwygDocument.getElementById('sceditor-start-marker');

    if (valueChangedKeyUpTimer) {
      clearTimeout(valueChangedKeyUpTimer);
      valueChangedKeyUpTimer = false;
    }

    if (hasSelection && saveRange) {
      rangeHelper.saveRange();
    }

    currentHtml = sourceMode ? sourceEditor.value : wysiwygBody.innerHTML;

    if (currentHtml !== triggerValueChanged.lastVal) {
      triggerValueChanged.lastVal = currentHtml;

      trigger(editorContainer, 'valuechanged', {
        rawValue: sourceMode ? base.val() : currentHtml
      });
    }

    if (hasSelection && saveRange) {
      rangeHelper.removeMarkers();
    }
  };

  valueChangedBlur = function () {
    if (valueChangedKeyUpTimer) {
      triggerValueChanged();
    }
  };

  valueChangedKeyUp = function (e) {
    var which         = e.which,
      lastChar      = valueChangedKeyUp.lastChar,
      lastWasSpace  = (lastChar === 13 || lastChar === 32),
      lastWasDelete = (lastChar === 8 || lastChar === 46);

    valueChangedKeyUp.lastChar = which;

    if (isComposing) {
      return;
    }

    if (which === 13 || which === 32) {
      if (!lastWasSpace) {
        triggerValueChanged();
      } else {
        valueChangedKeyUp.triggerNext = true;
      }
    
    } else if (which === 8 || which === 46) {
      if (!lastWasDelete) {
        triggerValueChanged();
      } else {
        valueChangedKeyUp.triggerNext = true;
      }
    } else if (valueChangedKeyUp.triggerNext) {
      triggerValueChanged();
      valueChangedKeyUp.triggerNext = false;
    }

    clearTimeout(valueChangedKeyUpTimer);

    valueChangedKeyUpTimer = setTimeout(function () {
      if (!isComposing) {
        triggerValueChanged();
      }
    }, 1500);
  };

  handleComposition = function (e) {
    isComposing = /start/i.test(e.type);

    if (!isComposing) {
      triggerValueChanged();
    }
  };

  autoUpdate = function () {
    base.updateOriginal();
  };

  init();
}

SCEditor.locale = {};

SCEditor.formats = {};
SCEditor.icons = {};

SCEditor.command =

{
  
  get: function (name) {
    return defaultCmds[name] || null;
  },

  set: function (name, cmd) {
    if (!name || !cmd) {
      return false;
    }

    cmd = extend(defaultCmds[name] || {}, cmd);

    cmd.remove = function () {
      SCEditor.command.remove(name);
    };

    defaultCmds[name] = cmd;
    return this;
  },

  remove: function (name) {
    if (defaultCmds[name]) {
      delete defaultCmds[name];
    }

    return this;
  }
};

	window.sceditor = {
		command: SCEditor.command,
		commands: defaultCmds,
		mathcommands: defaultMathCmds,
		defaultOptions: defaultOptions,

		ios: ios,
		isWysiwygSupported: isWysiwygSupported,

		regexEscape: regex,
		escapeEntities: entities,
		escapeUriScheme: uriScheme,

		dom: {
			css: css,
			attr: attr,
			removeAttr: removeAttr,
			is: is,
			closest: closest,
			width: width,
			height: height,
			traverse: traverse,
			rTraverse: rTraverse,
			parseHTML: parseHTML,
			hasStyling: hasStyling,
			convertElement: convertElement,
			blockLevelList: blockLevelList,
			canHaveChildren: canHaveChildren,
			isInline: isInline,
			copyCSS: copyCSS,
			fixNesting: fixNesting,
			findCommonAncestor: findCommonAncestor,
			getSibling: getSibling,
			removeWhiteSpace: removeWhiteSpace,
			extractContents: extractContents,
			getOffset: getOffset,
			getStyle: getStyle,
			hasStyle: hasStyle
		},
		locale: SCEditor.locale,
		icons: SCEditor.icons,
		utils: {
			each: each,
			isEmptyObject: isEmptyObject,
			extend: extend,
			get_unique_id: get_unique_id,
			find_opening_bracket: find_opening_bracket,
			find_closing_bracket: find_closing_bracket,
			check_firefox: check_firefox,
			check_chrome: check_chrome
		},
		plugins: PluginManager.plugins,
		formats: SCEditor.formats,
		create: function (textarea, options) {
			options = options || {};

			if (parent(textarea, '.sceditor-container')) {
				return;
			}

			if (options.runWithoutWysiwygSupport || isWysiwygSupported) {
				
				(new SCEditor(textarea, options));
			}
		},
		instance: function (textarea) {
			var vInstance;
			if (textarea && textarea._sceditor) {
				vInstance = textarea._sceditor
			}
			return vInstance;
		}
	};

}());