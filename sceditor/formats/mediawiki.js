/**
 * SCEditor MediaWiki Plugin
 * http://www.sceditor.com/
 *
 * Based on BBCodeParser from 2011-2017 by Sam Clarke (samclarke.com)
 * Software Design - usable as standalone parser for MediaWiki and
 *                   as format plugin for SCEditor
 *
 * MediaWiki Plugin for SCEditor is licensed under the MIT license
 * due to compatibility to the rest of the SCEditor code base:
 *	http://www.opensource.org/licenses/mit-license.php
 *
 * @fileoverview SCEditor MediaWiki Format
 * @author Sam Clarke, Engelbert Niehaus
 */
(function (sceditor) {
	/*eslint max-depth: off*/
	'use strict';

	var escapeEntities  = sceditor.escapeEntities;
	var escapeUriScheme = sceditor.escapeUriScheme;
	var dom             = sceditor.dom;
  var db4reference    = sceditor.db4reference;
  var utils           = sceditor.utils;
  var find_opening_bracket = utils.find_opening_bracket;
  var find_closing_bracket = utils.find_closing_bracket;

	var css    = dom.css;
	var attr   = dom.attr;
	var is     = dom.is;
	var extend = utils.extend;
	var each   = utils.each;
  var get_unique_id = utils.get_unique_id;
  var check_firefox = utils.check_firefox;
  var check_chrome  = utils.check_chrome;

	var getEditorCommand = sceditor.command.get;

  var EMOTICON_DATA_ATTR = 'data-sceditor-emoticon';
  var sec_delimiter = ["","=","==","===","====","=====","======"];
  var tag_delimiter = {
      "h1":"=",
      "h2":"==",
      "h3":"===",
      "h4":"====",
      "h5":"=====",
      "h6":"======"
  };

  var QuoteType = {
    /** @lends MediaWikiParser.QuoteType */
    /**
     * Always quote the attribute value
     */
    always: 1,

    /**
     * Never quote the attributes value
     * @type {Number}
     */
    never: 2,

    /**
     * Only quote the attributes value when it contains spaces to equals
     * @type {Number}
     */
    auto: 3
  };

  var names4wiki = {
    map2domain:{
      "w":"wikipedia",
      "b":"wikibooks",
      "v":"wikiversity",
      "wikipedia": "wikipedia",
      "wikibooks": "wikibooks",
      "wikiversity":"wikiversity",
  		"Wikipedia": "wikipedia",
      "Wikibooks": "wikibooks",
      "Wikiversity":"wikiversity"
    },
    files: [
      'file',
      'файл',
      'fitxer',
      'soubor',
      'datei',
      'archivo',
      'پرونده',
      'tiedosto',
      'mynd',
      "su'wret",
      'fichier',
      'bestand',
      'датотека',
      'dosya',
      'fil'
    ],
    images: [
      'image',
      'bild'
    ],
    templates: [
      'шаблён',
      'plantilla',
      'šablona',
      'vorlage',
      'template',
      'الگو',
      'malline',
      'snið',
      'shablon',
      'modèle',
      'sjabloon',
      'шаблон',
      'şablon'
    ],
    categories: [
      'катэгорыя',
      'categoria',
      'kategorie',
      'category',
      'categoría',
      'رده',
      'luokka',
      'flokkur',
      'kategoriya',
      'catégorie',
      'categorie',
      'категорија',
      'kategori',
      'kategoria',
      'تصنيف'
    ],
    redirects: [
      'перанакіраваньне',
      'redirect',
      'přesměruj',
      'weiterleitung',
      'redirección',
      'redireccion',
      'تغییر_مسیر',
      'تغییرمسیر',
      'ohjaus',
      'uudelleenohjaus',
      'tilvísun',
      'aýdaw',
      'айдау',
      'redirection',
      'doorverwijzing',
      'преусмери',
      'преусмјери',
      'yönlendi̇rme',
      'yönlendi̇r',
      '重定向',
      'redirección',
      'redireccion',
      '重定向',
      'yönlendirm?e?',
      'تغییر_مسیر',
      'تغییرمسیر',
      'перанакіраваньне',
      'yönlendirme'
    ],
    specials: [
      'спэцыяльныя',
      'especial',
      'speciální',
      'spezial',
      'special',
      'ویژه',
      'toiminnot',
      'kerfissíða',
      'arnawlı',
      'spécial',
      'speciaal',
      'посебно',
      'özel'
    ],
    users: [
      'удзельнік',
      'usuari',
      'uživatel',
      'benutzer',
      'user',
      'usuario',
      'کاربر',
      'käyttäjä',
      'notandi',
      'paydalanıwshı',
      'utilisateur',
      'gebruiker',
      'корисник',
      'kullanıcı'
    ],
    disambigs: [
      'disambig', //en
      'disambiguation', //en
      'dab', //en
      'disamb', //en
      'begriffsklärung', //de
      'ujednoznacznienie', //pl
      'doorverwijspagina', //nl
      '消歧义', //zh
      'desambiguación', //es
      'dubbelsinnig', //af
      'disambigua', //it
      'desambiguação', //pt
      'homonymie', //fr
      'неоднозначность', //ru
      'anlam ayrımı' //tr
    ],
    infoboxes: [
      'infobox',
      'ficha',
      'канадский',
      'inligtingskas',
      'inligtingskas3', //af
      'لغة',
      'bilgi kutusu', //tr
      'yerleşim bilgi kutusu',
      'infoboks' //nn, no
    ],
    sources: [
      //blacklist these headings, as they're not plain-text
      'references',
      'see also',
      'siehe auch',
      'external links',
      'further reading',
      'notes et références',
      'voir aussi',
      'liens externes'
    ]
  };
  // create a dictionary for all
  var dictionary = {};
  /*
  Object.keys(names4wiki).forEach(k => {
    names4wiki[k].forEach(w => {
      dictionary[w] = true;
    });
  });
  */
  for (var list in names4wiki) {
    if (names4wiki.hasOwnProperty(list)) {
      for (var i = 0; i < list.length; i++) {
        dictionary[list[i]] = true;
      }
    }
  }
  names4wiki.dictionary = dictionary;
  names4wiki.domain = {
    "w":"wikipedia",
    "b":"wikibooks",
    "v":"wikiversity",
    "wikipedia": "wikipedia",
    "wikibooks": "wikibooks",
    "wikiversity":"wikiversity"
  };
  names4wiki.ext4files = {
    image: [
      "gif",
      "png",
      "tiff",
      "tif",
      "jpg",
      "svg"
    ],
    audio: [
      "mp3",
      "ogg",
      "wav"
    ],
    video: [
      "avi",
      "mpeg2",
      "mp4",
      "ogv",
      "webm"
    ]
  };

  // returned "doc" is the storage container of collected data during parsing

  function get_default_doc(pLanguage,pDomain) {
    pLanguage = pLanguage || "en";
    pDomain = pDomain || "wikiversity";
    var now = new Date();

    return {
      "wikititle":"My Title",
      "src":"wiki text source",
      "timeid": Date.now(),
      "date": now.toJSON(),
      "mediapath":"https:/" + "/"+pLanguage+"."+pDomain+".org/wiki/Special:Redirect/file/",
      "remotemedia": true, // fetch media from wiki commons not, local base64
      "media": {
        "audio": [],
        "video": [],
        "image": []
      },
      "domain": pDomain,
      "language": pLanguage,
      "audiotype":"html", // dzslides reveal
      "timeid":"-",
      "links": {
          "int":[],
          "ext":[]
      },
      "mathexpr": [],
      "citations": [],
    }
  }

  function extend_default_doc (doc) {
    doc = doc || {};
    var def_doc = get_default_doc(doc.language,doc.domain);
    for (var att in def_doc) {
      if (def_doc.hasOwnProperty(att)) {
        if (!doc.hasOwnProperty(att)) {
          doc[att] = def_doc[att]
        }
      }
    }
    return doc;
  }

  function convertLínk2HTML(token, attrs, content) {
    // create the HTML-tag for the audio
    var link = '<a href="' +
      escapeEntities(_normaliseLink(attrs.defaultattr), true) +
      '">' + content + '</a>';
      if (attrs["linktype"]) {
        alert("LINK_TYPE: TOKEN['"+attrs["linktype"]+"']")
        switch (attrs["linktype"]) {
          case TOKEN_EXT_LINK:
          break;
          case TOKEN_INT_LINK:

          break;
          case TOKEN_IMAGE_LINK:

          break;
          case TOKEN_AUDIO_LINK:
          /*
          <audio controls>
            <source src="horse.ogg" type="audio/ogg">
            <source src="horse.mp3" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
          */

          break;
          case TOKEN_VIDEO_LINK:
          /*
          <video width="320" height="240" controls>
            <source src="movie.mp4" type="video/mp4">
            <source src="movie.ogg" type="video/ogg">
            Your browser does not support the video tag.
          </video>
          */

          break;
          default:

        }
      }
      return link;
  }

  function html2latex(str) {
      var ret = "";
      if (str) {
        ret = str.replace(/&lt;/g, '<')
					.replace(/&gt;/g, '>')
					.replace(/&amp;/g, '&');
      }
      return ret;
  }

  // ----- Menu Item Code Injection for marked code block -----
	var defaultCommandsOverrides = {
    bold: {
			txtExec: ['\'\'\'', '\'\'\'']
		},
		italic: {
			txtExec: ['\'\'', '\'\'']
		},
		underline: {
			txtExec: ['<ins>', '</ins>']
		},
		strike: {
			txtExec: ['<del>', '</del>']
		},
		subscript: {
			txtExec: ['<sub>', '</sub>']
		},
		superscript: {
			txtExec: ['<sup>', '</sup>']
		},
		left: {
			txtExec: ['<p style="text-align:left>', '</p>']
		},
		center: {
			txtExec: ['<p style="text-align:center>', '</p>']
		},
		right: {
			txtExec: ['<p style="text-align:right>', '</p>']
		},
		justify: {
			txtExec: ['<p style="text-align:justify>', '</p>']
		},
    header: {
			txtExec: function (caller) {
				var editor = this;

        getEditorCommand('header')._dropDown(
					editor,
					caller,
					function (headerSize) {
            var headerwrap = ["=","==","===","====","=====","======","======="];
            console.log("sceditor/formats/mediawiki.js:114 - insert header '"+headerwrap[headerSize]+"' with size="+headerSize);
						editor.insertText(
							'\n' + headerwrap[7-headerSize] + ' ',
							 ' ' + headerwrap[7-headerSize] + '\n'
						);
					}
				);
			}
		},
    font: {
			txtExec: function (caller) {
				var editor = this;

				getEditorCommand('font')._dropDown(
					editor,
					caller,
					function (fontName) {
						editor.insertText(
							'<span style="font-family:' + fontName + '>',
							'</span>'
						);
					}
				);
			}
		},
		size: {
			txtExec: function (caller) {
				var editor = this;

				getEditorCommand('size')._dropDown(
					editor,
					caller,
					function (fontSize) {
						editor.insertText(
							'<span  style="font-size:' + (11+(fontSize*2)) + 'px">',
							'</span>'
						);
					}
				);
			}
		},
    color: {
			txtExec: function (caller) {
				var editor = this;

				getEditorCommand('color')._dropDown(
					editor,
					caller,
					function (color) {
						editor.insertText(
							'<span style="color:' + color + '">',
							'</span>'
						);
					}
				);
			}
		},
    bulletlist: {
			txtExec: function (caller, selected) {
				this.insertText(
					'\n* ' +
					selected.split(/\r?\n/).join('\n* ') +
					'\n'
				);
			}
		},
		orderedlist: {
			txtExec: function (caller, selected) {
				this.insertText(
					'\n1. ' +
					selected.split(/\r?\n/).join('\n1. ') +
					'\n'
				);
			}
		},

    /*
    Description List HTML
    <dl>
        <dt>Title 1</dt>itl
        <dd>Explanation 1 - large feline </dd>

        <dt>Title 2</dt>
        <dd>Explanation 2 - A sea serpent.</dd>

    </dl>

    ; Title 1
    : Explanation 1 - A large feline

    ; Title 2
    : Explanation 2 - A sea serpent.

    */
    descriptionlist: {
			txtExec: function (caller, selected) {
				var linesplit = selected.split(/\r?\n/);
        var vSep = '\n; ';
        var out = "";
        for (var i = 0; i < linesplit.length; i++) {
          out += vSep + linesplit[i];
          if (vSep == '\n; ') {
            vSep = '\n: ';
          } else {
            vSep == '\n; '
          }
        }
        this.insertText(
					 out +
					'\n'
				);
			}
		},
		table: {
			txtExec: ['<table><tr><td>', '</td></tr></table>']
		},
		horizontalrule: {
			txtExec: ['<hr>']
		},
		code: {
			txtExec: ['<code>', '</code>']
		},
		image: {
			txtExec: function (caller, selected) {
				var	editor  = this;

				getEditorCommand('image')._dropDown(
					editor,
					caller,
					selected,
					function (url, width, height) {
						var attrs  = '';

						if (width) {
							attrs += '|width=' + width;
						}

						if (height) {
							attrs += '|height=' + height;
						}
						editor.insertText(
							'[[File:' + url + '|' + attrs + ']]'
						);
					}
				);
			}
		},
		email: {
			txtExec: function (caller, selected) {
				var	editor  = this;

				getEditorCommand('email')._dropDown(
					editor,
					caller,
					function (url, text) {
						editor.insertText(
							'<a href="mailto:' + url + '">' +
								(text || selected || url) +
							'</a>'
						);
					}
				);
			}
		},
		link: {
			txtExec: function (caller, selected) {
				var	editor  = this;

				getEditorCommand('link')._dropDown(
					editor,
					caller,
					function (url, text) {
            if (url && (url.indexOf("http") != 0)) {
              // local MediaWiki Link
              editor.insertText(
                '[[' + url + '|' +
                  (text || selected || url) +
                ']]'
              );
            } else {
              // external URL starting with "http:" "https:"
              editor.insertText(
  							'[' + url + ' ' +
  								(text || selected || url) +
  							']'
  						);
            }
					}
				);
			}
		},
		quote: {
			txtExec: ['<quote>', '</quote>']
		},
		youtube: {
			txtExec: function (caller) {
				var editor = this;

				getEditorCommand('youtube')._dropDown(
					editor,
					caller,
					function (id) {
						editor.insertText('<a href="' + id + '" class="youtubevideo">');
					}
				);
			}
		},
		rtl: {
			//txtExec: ['[rtl]', '[/rtl]']
      txtExec: ['<div style="direction: rtl">', '</div>']
		},
		ltr: {
			//txtExec: ['[ltr]', '[/ltr]']
      txtExec: ['<div style="direction: ltr">', '</div>']
		}
	};

  // the mediawikiHandlers are used
  // (1) to create the source code, when toggled to source code is clicked
  // (2) the bbcode handler defines how the mediawiki tags are transformed into HTML

  var mediawikiHandlers = {
    // START_COMMAND: a LINK
    div:{
      //allowedChildren:['*'],
      skipLastLineBreak: true,
			format: function (element, content) {
        //var code = content+" DIV-EXPORT";
        var code = content;
        var	link = "undefined-link";
        if (element) {
          if (hasClass(element, TOKEN_MATH_BLOCK_OPEN)) {
            console.log("sceditor/formats/mediawiki.js:663 - element='"+element.innerHTML+"'");
            code = "<mathdiv>\n  " + content + "<\mathdiv>";
          }
        } else {
          console.warn("sceditor/formats/mediawiki.js:355 - element is not defined!");
        }
        return code;
      }
    },
    // END_COMMAND: a LINK
    // START_COMMAND: Header
    header: {
      tags: {
        h1: null,
        h2: null,
        h3: null,
        h4: null,
        h5: null,
        h6: null
      },
      isInline: true,
			skipLastLineBreak: true,
			quoteType: QuoteType.never,
      format: function (element, content) {
        // format converts into source code - source
        var	size = 1;
        var out = "";
        // check tag of HTML element
        if (is(element, 'h1')) {
          size = 1;
        } else if (is(element, 'h2')) {
          size = 2;
        } else if (is(element, 'h3')) {
          size = 3;
        } else if (is(element, 'h4')) {
          size = 4;
        } else if (is(element, 'h5')) {
          size = 5;
        } else if (is(element, 'h6')) {
          size = 6;
        }
        if (content) {
          content = content.trim();
        };
        out = sec_delimiter[size]+' ' +content+' '+sec_delimiter[size]+' ';
        console.log("sceditor/formats/mediawiki.js:307 - size="+size+" content='"+content+"' html='"+out+"'");
        return out;
        //'[header=' + size + ']' + content + '[/header]';
      },
      html: '<h{defaultattr}>{0}</h{defaultattr}>'
    },
    // END_COMMAND Header
    // START_COMMAND: sqbracket
    sqbracket: {
      tags: {
				a1: null
			},
      format: function (element, content) {
        var code = content;
        var	link = "undefined-link";
        if (is(element, 'a')) {
          code = "[" + _normaliseLink(link)+ " "+ content + "]";
        }
        return code;
      },
      html:function (token, attrs, content) {
        return convertLínk2HTML(token, attrs, content);
      },
    },
    sqbracket2: {
      tags: {
				a1: null,
				img: null,
        audio: null,

			},
	    format: function (elm, content) {
				var	link = "undefined-link";

				//if (!is(elm, 'audio') || !(color = attr(elm, 'img'))) {
        if (is(elm, 'audio')) {
          console.log("sceditor/formats/mediawiki.js:377 - audio tag found");
        } else if (is(elm, 'img')) {
          console.log("sceditor/formats/mediawiki.js:379 - image tag found");
    		}

				return '[[Media' + _normaliseLink(link) + ' ' +
					content + ']]';
			},
			html: function (token, attrs, content) {
          // create the HTML-tag for the audio
          // check external or internal link with class of a
          return convertLínk2HTML(token, attrs, content);
			}
	  },
    // END_COMMAND sqbracket
    // START_COMMAND: Bold
    b: {
			tags: {
				b: null,
				strong: null
			},
			styles: {
				// 401 is for FF 3.5
				'font-weight': ['bold', 'bolder', '401', '700', '800', '900']
			},
			format: "'''{0}'''",
      //html: '<strong>{0}</strong>'
      html: '<b>{0}</b>'
		},
		// END_COMMAND

		// START_COMMAND: Italic
		i: {
			tags: {
				i: null,
				em: null
			},
			styles: {
				'font-style': ['italic', 'oblique']
			},
			format: "''{0}''",
			html: '<i>{0}</i>'
		},
		// END_COMMAND

		// START_COMMAND: Underline
		u: {
			tags: {
				u: null
			},
			styles: {
				'text-decoration': ['underline']
			},
			format: '<u>{0}</u>',
			html: '<u>{0}</u>'
		},
		// END_COMMAND

		// START_COMMAND: Strikethrough
		s: {
			tags: {
				s: null,
				strike: null
			},
			styles: {
				'text-decoration': ['line-through']
			},
			format: '<s>{0}</s>',  // MediaWiki
			html: '<s>{0}</s>'
		},
		// END_COMMAND

		// START_COMMAND: Subscript
		sub: {
			tags: {
				sub: null
			},
			format: '<sub>{0}</sub>', // MediaWiki
			html: '<sub>{0}</sub>' // HTML Preview
		},
		// END_COMMAND

		// START_COMMAND: Superscript
		sup: {
			tags: {
				sup: null
			},
			format: '<sup>{0}</sup>',  // MediaWiki
			html: '<sup>{0}</sup>'
		},
		// END_COMMAND

		// START_COMMAND: Font
		font: {
			tags: {
				font: {
					face: null
				}
			},
			styles: {
				'font-family': null
			},
			quoteType: QuoteType.never,
			format: function (element, content) {
				var font;

				if (!is(element, 'font') || !(font = attr(element, 'face'))) {
					font = css(element, 'font-family');
				}

				return '<span font=' + _stripQuotes(font) + ']' +
					content + '[/font]';
			},
			html: '<font face="{defaultattr}">{0}</font>'
		},
		// END_COMMAND

		// START_COMMAND: Size
		size: {
			tags: {
				font: {
					size: null
				}
			},
			styles: {
				'font-size': null
			},
			format: function (element, content) {
				var	fontSize = attr(element, 'size'),
					size     = 2;

				if (!fontSize) {
					fontSize = css(element, 'fontSize');
				}

				// Most browsers return px value but IE returns 1-7
				if (fontSize.indexOf('px') > -1) {
					// convert size to an int
					fontSize = fontSize.replace('px', '') - 0;

					if (fontSize < 12) {
						size = 1;
					}
					if (fontSize > 15) {
						size = 3;
					}
					if (fontSize > 17) {
						size = 4;
					}
					if (fontSize > 23) {
						size = 5;
					}
					if (fontSize > 31) {
						size = 6;
					}
					if (fontSize > 47) {
						size = 7;
					}
				} else {
					size = fontSize;
				}

				return '[size=' + size + ']' + content + '[/size]';
			},
			html: '<font size="{defaultattr}">{!0}</font>'
		},
		// END_COMMAND

		// START_COMMAND: Color
		color: {
			tags: {
				font: {
					color: null
				}
			},
			styles: {
				color: null
			},
			quoteType: QuoteType.never,
			format: function (elm, content) {
				var	color;

				if (!is(elm, 'font') || !(color = attr(elm, 'color'))) {
					color = elm.style.color || css(elm, 'color');
				}

				return '[color=' + _normaliseColour(color) + ']' +
					content + '[/color]';
			},
			html: function (token, attrs, content) {
				return '<font color="' +
					escapeEntities(_normaliseColour(attrs.defaultattr), true) +
					'">' + content + '</font>';
			}
		},
		// END_COMMAND

		// START_COMMAND: Lists
		ul: {
			tags: {
				ul: null
			},
			breakStart: true,
      allowedChildren: ['li'],
      isInline: false,
			skipLastLineBreak: true,
			format: '{0}',
			html: '<ul>{0}</ul>'
		},
		list: {
			breakStart: true,
			isInline: false,
      allowedChildren: ['li'],
      skipLastLineBreak: true,
      format: '{0}',
			html: '<ul>{0}</ul>'
		},
		ol: {
			tags: {
				ol: null
			},
      allowedChildren: ['li'],
      breakStart: true,
			isInline: false,
			skipLastLineBreak: true,
			format: '{0}',
			html: '<ol>{0}</ol>'
		},
		li: {
			tags: {
				li: null
			},
      // allowedChildren: ['ul', 'ol', 'dl','img','quote','b','i'],
      isInline: false,
      skipLastLineBreak: true,
			//format2: '\n* {0}',
			format: function (elm, content) {
        var prefix = elm.getAttribute("listprefix");
        prefix = prefix || "*??";
        //alert("sceditor/formats/mediawiki.js:996 - mediawikiHandler['li'] toSource(elm,content) prefix='"+prefix+"' content='"+content+"' elm.outerHTML="+elm.outerHTML);
        console.log("sceditor/formats/mediawiki.js:959 - mediawikiHandler['li'] toSource(elm,content) prefix='"+prefix+"' content='"+content+"' elm.outerHTML="+elm.outerHTML);
        return prefix + " " + content;
			},
      html: '<li>{0}</li>',
			html2: function (token, attrs,  content) {
        return "<li> EXPORT "+ content + "</li>"
      }
		},
		dl: {
      tags: {
				dl: null
			},
      isInline: false,
			allowedChildren: ['dt', 'dd'],
      skipLastLineBreak: true,
			//closedBy: ['/dl'],
      format: '{0}',
      html: '<dl>{0}</dl>'
		},
    dt: {
      tags: {
				dt: null
			},
      isInline: false,
      //allowedChildren: ['img','b','i',''],
      //closedBy: ['/dt','dt','dd'],
      skipLastLineBreak: true,
			//format2: '\n; {0}',
      format: function (elm, content) {
        var prefix = elm.getAttribute("listprefix");
        prefix = prefix || "*??";
        console.log("sceditor/formats/mediawiki.js:989 - mediawikiHandler['dt'] toSource(elm,content) prefix='"+prefix+"' content='"+content+"' elm.outerHTML="+elm.outerHTML);
        return prefix + " " + content;
			},
			html: '<dt style:"font-weight:bold">{0}</dt>'
		},
    dd: {
      tags: {
				dd: null
			},
      isInline: false,
      //allowedChildren: ['ul', 'ol', 'dl','img','quote'],
      //closedBy: ['dd','dt'],
      skipLastLineBreak: true,
			//format2: '\n: {0}',
      format: function (elm, content) {
        var prefix = elm.getAttribute("listprefix");
        prefix = prefix || "*??";
        console.log("sceditor/formats/mediawiki.js:1005 - mediawikiHandler['dd'] toSource(elm,content) prefix='"+prefix+"' content='"+content+"' elm.outerHTML="+elm.outerHTML);
        return prefix + " " + content;
			},
			html: '<dd style:"font-weight:lighter">{0}</dd>'
		},
		// END_COMMAND

		// START_COMMAND: Math
    math: {
			isInline: true,
			closedBy: ['ul','ol',"dl"],
      //allowedChildren: ['#'],
      allowedChildren: ['#', '#newline'],
			//format: '<math>{0}</math>',
      format: function (elm, content) {
        //alert("sceditor/formats/mediawiki.js:996 - toSource(elm,content) content='"+content+"' elm="+JSON.stringify(elm))
				var	display;

				if (!is(elm, 'math') || !(display = attr(elm, 'display'))) {
					display = "inline";
				}

				return '<math display="' + _normaliseDisplay(display) + '">' +
					html2latex(content) + '</math>';
		  },
      html: function (token, attrs,  content) {
          var out = " ";
          var display = "inline";
          var id4dom = "";
          var tag = "span";
          if (attrs) {
            if (attrs.display && (attrs.display == "block")) {
             display = _normaliseDisplay(attrs.display);
             tag = "div"
            }
            if (attrs.id) {
              id4dom = " id=\"" + attrs.id + "\" ";
            }
          }
          out = '<' + tag + ' class="math' + display + '" '
                  + 'latex="'+ encodeURIComponent(content) +'"'
                  + id4dom + '" >' + content + '</' + tag + '>';
          //alert("sceditor/formats/mediawiki.js:621 - mediawiki.math.html()-Call for content='"+out+"'");
          return out;
          //return '<mathjax display="' + display +
          //  '" source="'+atob(content)+'">' + content + '</mathjax>';
      }
      //html:'<math outtype="mathjax">{0}</math>'
  	},
    mathinline: { // UNUSED for source "format"
			isInline: true,
      //allowedChildren: ['#'],
      allowedChildren: ['#', '#newline'],
			closedBy: ['math','ul','ol',"dl"],
      format: '<math display="inline" out="check">{0}</math>',
			html: "\\(  {0} \\)"
		},
    mathblock: { // UNUSED for source "format"
			isInline: false,
      //allowedChildren: ['#'],
      allowedChildren: ['#', '#newline'],
			closedBy: ['math','ul','ol',"dl"],
      format: '<math display="block" out="check">{0}</math>',
			html: "\\[  {0} \\]"
		},
		// END_COMMAND Math

		// START_COMMAND: Table
		table: {
			tags: {
				table: null
			},
      allowedChildren: ['caption', 'tbody','thead','tr'],
			isInline: false,
			isHtmlInline: false,
			skipLastLineBreak: true,
			//format: "{| class=\"wikitable\" style=\"margin:auto\"{0}\n|}",
      format: function (element, content) {
        //content = content.replace(/^[\n]/g,"") || "";
        var out = "{| class=\"wikitable\" style=\"margin:auto\"" + content + "\n|}"
        return out;
      },
			html: '<table>{0}</table>'
		},
    caption: {
      tags: {
        caption: null
      },
      isInline: true,
      isHtmlInline: true,
      skipLastLineBreak: true,
      format: "\n|+{0}",
      html: '<caption>{0}</caption>'
    },
	  tr: {
			tags: {
				tr: null
			},
      allowedChildren: ['td', 'th'],
			isInline: false,
			skipLastLineBreak: true,
			//formatXXX: "\n|-\n{0}",
      format: function (element, content) {
        var out = content.replace(/\n/g,"");
        /*|+ Caption text
|-
! Header text 1 !! Header text 2 !! Header text 3
|-
| ExampleR1C1 || ExampleR1C2 || ExampleR1C3
|-
        */
        return "|-\n" + out;
      },
			html: '<tr>{0}</tr>'
		},
		th: {
			tags: {
				th: null
			},
			allowsEmpty: true,
			isInline: false,
      skipLastLineBreak: true,
			//formatXXX: "\n|-\n! {0} !",
      format: function (element, content) {
        var out = "";
        if (isFirstSibling(element) == true) {
          out += "\n! ";
        } else {
          out += " !! ";
        };
        out += content;
        return out;
      },
			html: '<th>{0}</th>'
		},
		td: {
			tags: {
				td: null
			},
			allowsEmpty: true,
			isInline: false,
      skipLastLineBreak: true,
			//format: '[td]{0}[/td]',
      //formatXXX: '| {0} |',
      format: function (element, content) {
        var out = "";
        if (isFirstSibling(element) == true) {
          out += "\n| ";
        } else {
          out += " || ";
        };
        out += content;
        return out;
      },
			html: '<td>{0}</td>'
		},
		// END_COMMAND

		// START_COMMAND: Emoticons
		emoticon: {
			allowsEmpty: true,
			tags: {
				img: {
					src: null,
					'data-sceditor-emoticon': null
				}
			},
			format: function (element, content) {
				return attr(element, EMOTICON_DATA_ATTR) + content;
			},
			html: '{0}'
		},
		// END_COMMAND

		// START_COMMAND: Horizontal Rule
		hr: {
			tags: {
				hr: null
			},
			allowsEmpty: true,
			isSelfClosing: true,
			isInline: false,
			format: '\n----',
			html: '<hr />'
		},
		// END_COMMAND

		// START_COMMAND: Image
		img: {
			allowsEmpty: true,
			tags: {
				img: {
					src: null
				}
			},
			allowedChildren: ['#'],
			quoteType: QuoteType.never,
			format: function (element, content) {
				var	width, height,
					attribs   = '',
					style     = function (name) {
						return element.style ? element.style[name] : null;
					};

				// check if this is an emoticon image
				if (attr(element, EMOTICON_DATA_ATTR)) {
					return content;
				}

				width = attr(element, 'width') || style('width');
				height = attr(element, 'height') || style('height');

				// only add width and height if one is specified
				if ((element.complete && (width || height)) ||
					(width && height)) {

					attribs = '=' + dom.width(element) + 'x' +
						dom.height(element);
				}

				return '[[' + attribs + ']' + attr(element, 'src') + ']]';
			},
			html: function (token, attrs, content) {
				var	undef, width, height, match,
					attribs = '';

				// handle [img width=340 height=240]url[/img]
				width  = attrs.width;
				height = attrs.height;

				// handle [img=340x240]url[/img]
				if (attrs.defaultattr) {
					match = attrs.defaultattr.split(/x/i);

					width  = match[0];
					height = (match.length === 2 ? match[1] : match[0]);
				}

				if (width !== undef) {
					attribs += ' width="' + escapeEntities(width, true) + '"';
				}

				if (height !== undef) {
					attribs += ' height="' + escapeEntities(height, true) + '"';
				}

				return '<img' + attribs +
					' src="' + escapeUriScheme(content) + '" />';
			}
		},
		// END_COMMAND Image

    // START_COMMAND: A
		a: {
      allowsEmpty: true,
      tags: {
        a: {
          href: null
        }
      },
      quoteType: QuoteType.never,
      format: function (element, content) {
        /*
        attrs={
          "href": "https://en.wikiversity.org/wiki/internal_link",
          "id": "INTLINK1690555480609C4",
          "linktype": "INTLINK",
          "link": "internal link"
        }
        */
        var url = attr(element, 'href');
        var link = attr(element, 'link');
        var linktype = attr(element, 'linktype');

        // make sure this link is not an e-mail,
        // if it is return e-mail MediaWiki
        var outlink = "";
        if (url.substr(0, 7) === 'mailto:') {
          outlink = '[[mailto:' + url.substr(7) +'|' +  content + ']]';
        }
        if (linktype) {
            switch (linktype) {
              case "INTLINK":
                if (content) {
                   if (content == url) {
                     outlink =  '[['+link+']]';
                   } else {
                     outlink = '[['+link+'|' + content + ']]'
                   }
                } else {
                   outlink = '[['+link+']]'
                }
              break;
              case "EXTLINK":
                if (content) {
                  if (content == url) {
                    outlink = '['+url+']'
                  } else {
                    outlink = '['+url+' ' + content + ']';
                  }
                }3
              break;
              default:
                // treat all other links as external links
                outlink = '[' + url + ' ' +  content + ']';
            }
        } else {
          outlink = '['+url+' ' + content +']'
        };

        return outlink;

        //return '<a class="linkurl" href="' + url + '" target="_blank">' + content + '</a>';
      }
    },
    // END_COMMAND: A

		// START_COMMAND: URL
		url: {
			allowsEmpty: true,
			tags: {
				a: {
					href: null,
          type4link: null,
          path: null,
          id: null,
          link: null
				}
			},
			quoteType: QuoteType.never,
			format: function (element, content) {
        var vOutURL = "";
        //alert("sceditor/formats/mediawiki.js:1308 - mediawikiHandlers.url.format(el,content) content='"+content+"'");
				var url = attr(element, 'href4link') || attr(element, 'href') || "unknown-url";
        var link = attr(element, 'link') || "";
        var path = attr(element, 'path') || "";
        var linktype = attr(element, 'type4link') || "EXTLINK";
        var urlid = (' id="'+attr(element, 'id')+'" ') || "";
				// make sure this link is not an e-mail,
				// if it is return e-mail MediaWiki
				if (url.substr(0, 7) === 'mailto:') {
					vOutURL = '[mailto:' + url + ' ' + url.substr(7) + ']';
				} else {
          if (linktype == "EXTLINK") {
            content = linked_text(content);
            vOutURL = '['+ url + ' ' + (content || url) + ']';
          } else {
            // --- INTLINK ---
            //alert("Is an INTLINK '"+content+"'");
            if (content) {
              content = linked_text(content);
              if (link == content) {
                vOutURL = '[['+ link + ']]'
              } else {
                vOutURL = '[['+ link + '|' + content + ']]';
              }
            } else {
              vOutURL = '[['+ link + ']]';
            }
            //alert("sceditor/formats/mediawiki.js:1332 INTLINK='"+vOutURL+"'");
          }
        }

				return vOutURL;
			},
			html: function (token, attrs, content) {
        var ret;
        //alert("mediawikiHandlers.url.attrs="+JSON.stringify(attrs,null,4));
        /*
        attrs={
          "href": "https://en.wikiversity.org/wiki/internal_link",
          "id": "INTLINK1690555480609C4",
          "linktype": "INTLINK",
          "link": "internal link"
        }
        */
				attrs.defaultattr =
					escapeEntities(attrs.defaultattr, true) || content;

				//ret = '<a href="' + escapeUriScheme(attrs.defaultattr) + '" url="'+attr(element, 'url')+'" link="'+attr(element, 'link')+'" id="'+attr(element, 'id')+'" linktype="'+attr(element, 'linktype')+'">' + content + '</a>';
        ret = '<a href="' + escapeUriScheme(attrs.href) + '" type4link="' + attrs.type4link +'" id="'+attrs.id+'"' ;
        if (attrs.type4link == 'INTLINK') {
          ret += ' link="'+attrs.link+'"';
        }
        if (attrs.path) {
          ret += '" path="'+attrs.path+'"'
        }
        ret += '>' +	content + '</a>';
          // <url href="intlink.url" id="intlink.id" linktype="intlink.type" link="intlink.link">intlink.text</url>;
        //ret = '<a href="#" onclick="alert(\'URL: \'+this.url)" url="' + escapeUriScheme(attrs.defaultattr) + '">'+content+"</a>";
        //alert("mediawikiHandlers.url.attrs="+JSON.stringify(attrs,null,4)+" ret='"+ret+"'");

        return ret;
			}
		},
		// END_COMMAND

		// START_COMMAND: E-mail
		email: {
			quoteType: QuoteType.never,
			html: function (token, attrs, content) {
				return '<a href="mailto:' +
					(escapeEntities(attrs.defaultattr, true) || content) +
					'">' + content + '</a>';
			}
		},
		// END_COMMAND

		// START_COMMAND: Quote
		quote: {
			tags: {
				blockquote: null
			},
			isInline: false,
			quoteType: QuoteType.never,
			format: function (element, content) {
				var authorAttr = 'data-author';
				var	author = '';
				var cite;
				var children = element.children;

				for (var i = 0; !cite && i < children.length; i++) {
					if (is(children[i], 'cite')) {
						cite = children[i];
					}
				}

				if (cite || attr(element, authorAttr)) {
					author = cite && cite.textContent ||
						attr(element, authorAttr);

					attr(element, authorAttr, author);

					if (cite) {
						element.removeChild(cite);
					}

					content	= this.elementToMediawiki(element);
					author  = '=' + author.replace(/(^\s+|\s+$)/g, '');

					if (cite) {
						element.insertBefore(cite, element.firstChild);
					}
				}

				return '[quote' + author + ']' + content + '[/quote]';
			},
			html: function (token, attrs, content) {
				if (attrs.defaultattr) {
					content = '<cite>' + escapeEntities(attrs.defaultattr) +
						'</cite>' + content;
				}

				return '<blockquote>' + content + '</blockquote>';
			}
		},
		// END_COMMAND

		// START_COMMAND: Code
		code: {
			tags: {
				code: null
			},
			isInline: false,
			allowedChildren: ['#', '#newline'],
			format: '<code language="">{0}</code>',
			//html: '<code>{0}</code>'
      html: function (token, attrs, content) {
        var vLanguageSet = "";
        if (attrs.language) {
          vLanguageSet = ' language="'+attrs.language+'"'
        }
        return '<code' + vLanguageSet + '>' + content + '</code>'
      }
		},
		// END_COMMAND


		// START_COMMAND: Left
		left: {
			styles: {
				'text-align': [
					'left',
					'-webkit-left',
					'-moz-left',
					'-khtml-left'
				]
			},
			isInline: false,
			allowsEmpty: true,
			format: '<div align="left">{0}</div>',
			html: '<div align="left">{0}</div>'
		},
		// END_COMMAND

		// START_COMMAND: Centre
		center: {
			styles: {
				'text-align': [
					'center',
					'-webkit-center',
					'-moz-center',
					'-khtml-center'
				]
			},
			isInline: false,
			allowsEmpty: true,
			//format: '[center]{0}[/center]',
      format: '<div align="center">{0}</div>',
      html: '<div align="center">{0}</div>'
		},
		// END_COMMAND

		// START_COMMAND: Right
		right: {
			styles: {
				'text-align': [
					'right',
					'-webkit-right',
					'-moz-right',
					'-khtml-right'
				]
			},
			isInline: false,
			allowsEmpty: true,
			format: '<div align="right">{0}</div>', // Source Code
			html: '<div align="right">{0}</div>'
		},
		// END_COMMAND

		// START_COMMAND: Justify
		justify: {
			styles: {
				'text-align': [
					'justify',
					'-webkit-justify',
					'-moz-justify',
					'-khtml-justify'
				]
			},
			isInline: false,
			allowsEmpty: true,
			//format: '[justify]{0}[/justify]',
      format: '<div align="justify">{0}</div>', // Source Code
			html: '<div align="justify">{0}</div>'
		},
		// END_COMMAND
    // START_COMMAND: YouTube
    video4wiki: {
      allowsEmpty: true,
      tags: {
        iframe: {
          'data-mediawiki-id': null
        }
      },
      format: function (element, content) {
        element = attr(element, 'data-youtube-id');

        return element ? '[[File:' + element + '|thumb|' + content + ']]' : content;
      },
      html: function (token, attrs, content) {
        var vFilename = "unknown_file.webm";
        var vMediaPath = "https:/"+"/en.wikiversity.org/wiki/Special:Redirect/file/";
        var vHeightSet = "";
        var vWidthSet = ' width="480"';
				if (attrs.defaultattr) {
					vFilename = escapeEntities(attrs.defaultattr);
				}
        if (attrs.width) {
				  vWidthSet = ' width="'+attrs.width+'"';
        }
        if (attrs.height) {
					vHeightSet = ' height="'+attrs.height+'" ';
      	}
        return '<video '+vWidthSet+'" '+vHeightSet+' controls>' +
          '<source src="' + vMediaPath + vFilename +'" ' +
          'data-mediawiki-id="' + escapeEntities(vFilename) + '" allowfullscreen></video>'
      }
    },
    // END_COMMAND

		// START_COMMAND: YouTube
		youtube: {
			allowsEmpty: true,
			tags: {
				iframe: {
					'data-youtube-id': null
				}
			},
			format: function (element, content) {
				element = attr(element, 'data-youtube-id');

				return element ? '[youtube]' + element + '[/youtube]' : content;
			},
			html: '<iframe width="560" height="315" frameborder="0" ' +
				'src="https:/' + '/www.youtube-nocookie.com/embed/{0}?wmode=opaque" ' +
				'data-youtube-id="{0}" allowfullscreen></iframe>'
		},
		// END_COMMAND


		// START_COMMAND: Rtl
		rtl: {
			styles: {
				direction: ['rtl']
			},
			isInline: false,
			//format: '[rtl]{0}[/rtl]',
      format: '<div style="direction: rtl">{0}</div>',
			html: '<div style="direction: rtl">{0}</div>'
		},
		// END_COMMAND

		// START_COMMAND: Ltr
		ltr: {
			styles: {
				direction: ['ltr']
			},
			isInline: false,
			//format: '[ltr]{0}[/ltr]',
      format: '<div style="direction: ltr">{0}</div>',
			html: '<div style="direction: ltr">{0}</div>'
		},
		// END_COMMAND

		// this is here so that commands above can be removed
		// without having to remove the , after the last one.
		// Needed for IE.
		ignore: {}
	};

	/*
	 * Formats a string replacing {name} with the values of
	 * obj.name properties.  The string 'str' is populated from
	 * 'templates'
	 * If there is no property for the specified {name} then
	 * it will be left intact.
   * formatMediaWikiString takes a template from "templates"
   *  and renders content and attributes for the template
   */

	 /**
	 * @param  {string} str
	 * @param  {Object} obj
	 * @return {string}
	 * @since 2.0.0
	 */
	function formatMediaWikiString(str, obj) {
		return str.replace(/\{([^}]+)\}/g, function (match, group) {
			var	undef,
				escape = true;

			if (group.charAt(0) === '!') {
				escape = false;
				group = group.substring(1);
			}

			if (group === '0') {
				escape = false;
			}

			if (obj[group] === undef) {
				return match;
			}

			return escape ? escapeEntities(obj[group], true) : obj[group];
		});
	}

  function linked_text(content) {
    var ret = "";
    if (content) {
      ret = content;
      var found = content.indexOf(' ')+1;
      if (found > 0) {
        ret = content.substring(found);
      } else {
        ret = content;
      }
      if (ret) {
        ret = ret.replace(/[\]\s]+$/,"");
      }
    }
    console.log("sceditor/formats/mediawiki.js:1604 - linked_text('"+content+"')='"+ret+"'")
    return ret;
  }

  function isFirstSibling(node) {
      var ret = true;
      if (node && node.previousSibling) {
        ret = false;
      }
      return ret;
  }

	/**
	 * Removes the first and last divs from the HTML.
	 *
	 * This is needed for pasting
	 * @param  {string} html
	 * @return {string}
	 * @private
	 */
	function removeFirstLastDiv(html) {
		var	node, next, removeDiv,
			output = document.createElement('div');

		removeDiv = function (node, isFirst) {
			// Don't remove divs that have styling
			if (dom.hasStyling(node)) {
				return;
			}

			if ((node.childNodes.length !== 1 ||
				!is(node.firstChild, 'br'))) {
				while ((next = node.firstChild)) {
					output.insertBefore(next, node);
				}
			}

			if (isFirst) {
				var lastChild = output.lastChild;

				if (node !== lastChild && is(lastChild, 'div') &&
					node.nextSibling === lastChild) {
					output.insertBefore(document.createElement('br'), node);
				}
			}

			output.removeChild(node);
		};

		css(output, 'display', 'none');
		output.innerHTML = html.replace(/<\/div>\n/g, '</div>');

		if ((node = output.firstChild) && is(node, 'div')) {
			removeDiv(node, true);
		}

		if ((node = output.lastChild) && is(node, 'div')) {
			removeDiv(node);
		}

		return output.innerHTML;
	}

	function isFunction(fn) {
		return typeof fn === 'function';
	}

	/**
	 * Removes any leading or trailing quotes ('")
	 *
	 * @return string
	 * @since v1.4.0
	 */
	function _stripQuotes(str) {
		return str ?
			str.replace(/\\(.)/g, '$1').replace(/^(["'])(.*?)\1$/, '$2') : str;
	}

	/**
	 * Formats a string replacing {0}, {1}, {2}, ect. with
	 * the params provided
	 *
	 * @param {string} str The string to format
	 * @param {...string} arg The strings to replace
	 * @return {string}
	 * @since v1.4.0
	 */
	function _formatString(str) {
		var	undef;
		var args = arguments;
    if (str) {
      return str.replace(/\{(\d+)\}/g, function (_, matchNum) {
        return args[matchNum - 0 + 1] !== undef ?
          args[matchNum - 0 + 1] :
          '{' + matchNum + '}';
      });
    } else {
      return "";
    }
	}

  	var TOKEN_OPEN = 'open';
    var REGEX_OPEN = /^<[^<>\n]+>/;
    var TOKEN_CLOSE = 'close';
    var REGEX_CLOSE = /^<\/([^<>\n])+>/;
    var TOKEN_SELF_CLOSE = 'selfclose';
    var REGEX_SELF_CLOSE =  /^<[^<>\n]+\/>/;

    var TOKEN_CONTENT = 'content';
    var REGEX_CONTENT = /^([^\[\]\r\n<']+|\[)/;

  	var TOKEN_NEWLINE = 'newline';
    var REGEX_NEWLINE =  /^(\r\n|\r|\n)/;

    var TOKEN_HEADER = 'header';
    var REGEX_HEADER = /^\n?=[=]+[^=\n]+=[=]+/;

    var TOKEN_SQBRACKET = "sqbracket";
    var TOKEN_SQBRACKET2 = "sqbracket2";
    var TOKEN_SQBRACKET_OPEN = "sqbracketopen";
    var TOKEN_SQBRACKET2_OPEN = "sqbracket2open";
    var REGEX_SQBRACKET_OPEN = /^\[[\[]?/;
    //var REGEX_SQBRACKET_OPEN = /^\[\[/;
    //var TOKEN_SQBRACKET2_OPEN = "sqbracket2open";
    //var REGEX_SQBRACKET2_OPEN = /^\[\[/;
    //var REGEX_SQBRACKET_MULTIPLE_OPEN = /^\[[\[]?/;
    var TOKEN_SQBRACKET_CLOSE = "sqbracketclose";
    var TOKEN_SQBRACKET2_CLOSE = "sqbracket2close";
    var REGEX_SQBRACKET_CLOSE = /^\][\]]?/;

    var TOKEN_INT_LINK    = 'intlink';
    var TOKEN_IMAGE_LINK  = 'imagelink';
    var TOKEN_AUDIO_LINK  = 'audiolink';
    var TOKEN_VIDEO_LINK  = 'videolink';
    var TOKEN_EXT_LINK = 'extlink';
    var REGEX_EXT_LINK = 'extlink';

    var TOKEN_MATH = 'math';
    var TOKEN_MATH_OPEN = 'mathopen';
    var REGEX_MATH_OPEN = /^<math[^>]*>/i;
    var TOKEN_MATH_CLOSE = 'mathclose';
    var REGEX_MATH_CLOSE = /^<\/math[^>]*>/i;
    var REGEX_MATH_CLOSE = 'mathopen';
    var TOKEN_MATH_BLOCK = 'mathblock';
    var TOKEN_MATH_BLOCK_OPEN = 'mathblockopen';
    var REGEX_MATH_BLOCK_OPEN = /^\\\[/;
    var TOKEN_MATH_BLOCK_CLOSE = 'mathblockclose';
    var REGEX_MATH_BLOCK_CLOSE = /^\\\]/;
    var CLASS_MATH_EDIT = "link4mathedit";

    var TOKEN_MATH_INLINE = 'mathinline';
    var TOKEN_MATH_INLINE_OPEN = 'mathinlineopen';
    var REGEX_MATH_INLINE_OPEN = /^\\\(/;
    var TOKEN_MATH_INLINE_CLOSE = 'mathinlineclose';
    var REGEX_MATH_INLINE_CLOSE = /^\\\)/;
    var TOKEN_LATEX = "latex";

    var TOKEN_FORMAT = 'format';
    var TOKEN_BF_IT = 'boldfaceitalics';
    var REGEX_BF_IT = /^'[']+/;
    var TOKEN_BF = 'boldface';
    var REGEX_BF = /^'''/;
    var TOKEN_IT = 'italics';
    var REGEX_IT = /^''/;
    var TOKEN_LIST = "list";
    var REGEX_LIST = /^\n[:*#;]*[*#]/;
    var TOKEN_LIST_ITEM = "listitem";
    var TOKEN_DESCRIPTION = "description"; //dl
    var REGEX_DESCRIPTION = /^\n[:*#;]*[;]/;
    var TOKEN_DESCRIPTION_TITLE = "descriptiontitle"; //dt
    var TOKEN_DESCRIPTION_DATA  = "descriptiondata"; //dd
    var TOKEN_DESCRIPTION_ITEM  = "descriptionitem";  //dt or dd

    var TOKEN_INDENT_LIST = "indentlist";
    var TOKEN_INDENT = "indent";
    var REGEX_INDENT = /^\n[:*#;]*[:]/;

	/*
	 * @typedef {Object} TokenizeToken
	 * @property {string} type
	 * @property {string} name
	 * @property {string} val
	 * @property {Object.<string, string>} attrs
	 * @property {array} children
	 * @property {TokenizeToken} closing
	 */

	/**
	 * Tokenize token object
	 *
	 * @param  {string} type The type of token this is,
	 *                       should be one of tokenType
	 * @param  {string} name The name of this token
	 * @param  {string} val The originally matched string
	 * @param  {array} attrs Any attributes. Only set on
	 *                       TOKEN_TYPE_OPEN tokens
	 * @param  {array} children Any children of this token
	 * @param  {TokenizeToken} closing This tokens closing tag.
	 *                                 Only set on TOKEN_TYPE_OPEN tokens
	 * @class {TokenizeToken}
	 * @name {TokenizeToken}
	 * @memberOf MediaWikiParser.prototype
	 */
	// eslint-disable-next-line max-params
	function TokenizeToken(type, name, val, attrs, children, closing) {
		var base      = this;

		base.type     = type;
		base.name     = name;
		base.val      = val;
		base.attrs    = attrs || {};
		base.children = children || [];
		base.closing  = closing || null;
	};

	TokenizeToken.prototype = {
		/** @lends MediaWikiParser.prototype.TokenizeToken */
		/**
		 * Clones this token
		 *
		 * @return {TokenizeToken}
		 */
		clone: function () {
			var base = this;

			return new TokenizeToken(
				base.type,
				base.name,
				base.val,
				extend({}, base.attrs),
				[],
				base.closing ? base.closing.clone() : null
			);
		},
		/**
		 * Splits this token at the specified child
		 *
		 * @param  {TokenizeToken} splitAt The child to split at
		 * @return {TokenizeToken} The right half of the split token or
		 *                         empty clone if invalid splitAt lcoation
		 */
		splitAt: function (splitAt) {
			var offsetLength;
			var base         = this;
			var	clone        = base.clone();
			var offset       = base.children.indexOf(splitAt);

			if (offset > -1) {
				// Work out how many items are on the right side of the split
				// to pass to splice()
				offsetLength   = base.children.length - offset;
				clone.children = base.children.splice(offset, offsetLength);
			}

			return clone;
		}
	};


	/**
	 * SCEditor MediaWiki parser class
	 *
	 * @param {Object} options
	 * @class MediaWikiParser
	 * @name MediaWikiParser
	 * @since v1.4.0
	 */
	function MediaWikiParser(options) {
		var base = this;

		base.opts = extend({}, MediaWikiParser.defaults, options);

		/**
		 * Takes a MediaWiki string and splits it into open,
		 * content and close tags.
		 *
		 * It does no checking to verify a tag has a matching open
		 * or closing tag or if the tag is valid child of any tag
		 * before it. For that the tokens should be passed to the
		 * parse function.
		 *
		 * @param {string} str
		 * @return {array}
		 * @memberOf MediaWikiParser.prototype
		 */
		base.tokenize = function (str) {
			var	matches, type, i;
      var mathstack = [];
      var liststack = [];
			var tokens = [];
      // leader header -- add newline to match regular expression
      if (str.indexOf("==") == 0) {
        str = "\n"+str;
      }
			// The token types in reverse order of precedence
			// (they're looped in reverse)
			var tokenTypes = [
				{
					type: TOKEN_CONTENT,
					regex: REGEX_CONTENT
				},
				{
					type: TOKEN_NEWLINE,
					regex: REGEX_NEWLINE
				},
        {
					type: TOKEN_LIST,
					regex: REGEX_LIST
				},
        {
					type: TOKEN_INDENT,
					regex: REGEX_INDENT
				},
        {
					type: TOKEN_DESCRIPTION,
					regex: REGEX_DESCRIPTION
				},
        {
					type: TOKEN_HEADER,
					regex: REGEX_HEADER
				},
				{
					type: TOKEN_OPEN,
					regex: REGEX_OPEN
				},
				// Close must come before open as they are
				// the same except close has a / at the start.
				{
					type: TOKEN_CLOSE,
          regex: REGEX_CLOSE
				},
        {
          type: TOKEN_SQBRACKET_OPEN,
          regex: REGEX_SQBRACKET_OPEN
        },
        {
          type: TOKEN_SQBRACKET_CLOSE,
          regex: REGEX_SQBRACKET_CLOSE
        },
        {
					type: TOKEN_BF_IT,
					regex: REGEX_BF_IT
				},
				{
					type: TOKEN_SELF_CLOSE,
          regex: REGEX_SELF_CLOSE
				} /*,
				{
					type: TOKEN_MATH_OPEN,
          regex: REGEX_MATH_OPEN
				},
				{
					type: TOKEN_MATH_CLOSE,
          regex: REGEX_MATH_CLOSE
				} */
			];
      var tok;
			strloop:
			while (str.length) {
				i = tokenTypes.length;
				while (i--) {
					type = tokenTypes[i].type;
          //console.log("sceditor/formats/mediawiki.js:1181 - str='"+str+"' type["+i+"]='"+type+"' tokenType["+i+"]='"+JSON.stringify(tokenTypes[i],null,4)+"'");

					// Check if the string matches any of the tokens
					if (!(matches = str.match(tokenTypes[i].regex)) ||
						!matches[0]) {
						continue;
					}
          console.log("sceditor/formats/mediawiki.js:1320 - matched token '"+matches[0]+"' with type='"+type+"'");
					// Add the match to the tokens list
          tok = tokenizeTag(type, matches[0],liststack);
          tokens.push(tok);

					// Remove the match from the string
					str = str.substr(matches[0].length);

          switch (tok.type) {
            case TOKEN_MATH_BLOCK_OPEN:
              var mc = (str.toLowerCase()).indexOf("</math>");
              if (mc >= 0) {
                var latex = str.substr(0,mc);
                str = str.substr(mc);
                tokens.push(tokenizeTag("TOKEN_LATEX", latex, liststack));
              }
            break;
            case TOKEN_MATH_INLINE_OPEN:
              var mc = (str.toLowerCase()).indexOf("</math>");
              if (mc >= 0) {
                var latex = str.substr(0,mc);
                str = str.substr(mc);
                tokens.push(tokenizeTag("TOKEN_LATEX", latex,liststack));
              }
            break;
            default:
          }
					// The token has been added so start again
					continue strloop;
				}

				// If there is anything left in the string which doesn't match
				// any of the tokens then just assume it's content and add it.
				if (str.length) {
					tokens.push(tokenizeTag(TOKEN_CONTENT, str,liststack));
				}

				str = '';
			}

			return tokens;
		};

		/**
		 * Extracts the name an params from a tag
		 *
		 * @param {string} type
		 * @param {string} val
		 * @return {Object}
		 * @private
		 */
		function tokenizeTag(type, val,liststack) {
      liststack = liststack || [];
			var matches, attrs, name;
			//var openRegex  = /\[([^\]\s=]+)(?:([^\]]+))?\]/,
			//var closeRegex = /\[\/([^\[\]]+)\]/;
      //var openRegex = REGEX_OPEN;
      // /\[([^\]\s=]+)(?:([^\]]+))?\]/,
      //var closeRegex = REGEX_CLOSE;
      // /\[\/([^\[\]]+)\]/;

			// Extract the name and attributes from opening tags and
			// just the name from closing tags.
      //alert("sceditor/formats/mediawiki.js:1297 - Token type='"+(type || "undef-type")+"' val='"+(val || "-")+"'")

			if (type === TOKEN_OPEN) {
        if (matches = val.match(REGEX_OPEN)) {
          var tag = matches[0];
          var cfirst = tag.substr(0,1);
          var clast = tag.substr(tag.length-1,1);
          if ((cfirst == "<") && (clast == ">")) {
            var innertag = tag.substr(tag.indexOf("<")+1,tag.lastIndexOf(">")-tag.indexOf("<")-1);
            //alert("sceditor/formats/mediawiki.js:1371 - innertag='"+innertag+"'");
            console.log("sceditor/formats/mediawiki.js:1372 - innertag='"+innertag+"'");
            // check attributes are defined
            // split innertag at blanks
            var att_array = innertag.split(/[\s]+/);
            name = lower(att_array.shift());
            console.log("sceditor/formats/mediawiki.js:1577 - tokenizeTag('<"+name+" ...>') name='"+name+"'");
            var attstr = att_array.join(" ");
            if (attstr && (attstr = attstr.trim())) {
              console.log("sceditor/formats/mediawiki.js:1380 - attstr='"+attstr+"'");
    					attrs = tokenizeAttrs(attstr);
    				}
          } else {
            console.warn("expecting a tag but '"+tag+"' is not a tag");
          }
  			}
      }


      if (type === TOKEN_CLOSE &&
      	 (matches = val.match(REGEX_CLOSE))) {
           tag = lower(matches[0]);
           name = tag.replace(/[^a-z]/g,"");
           console.log("sceditor/formats/mediawiki.js:1595 -  CLOSE tokenizeTag('</"+name+" ...>') name='"+name+"' tag='"+tag+"'");
       }

      if (type === TOKEN_SQBRACKET_OPEN) {
        type = TOKEN_OPEN;
        if (val == "[[") {
          console.log("sceditor/formats/mediawiki.js:1492 - token='"+TOKEN_SQBRACKET2_OPEN+"' found with val='"+val+"'");
          name = TOKEN_SQBRACKET2;
        } else {
          name = TOKEN_SQBRACKET;
        }
      }

      if (type === TOKEN_SQBRACKET_CLOSE) {
        type = TOKEN_CLOSE;
        if (val == "]]") {
          console.log("sceditor/formats/mediawiki.js:1499 - token='"+TOKEN_SQBRACKET2_CLOSE+"' found with val='"+val+"'");
          name = TOKEN_SQBRACKET2;
        } else {
          name = TOKEN_SQBRACKET;
        }
      }


      if (type === TOKEN_LIST) {
        var rec = tokenizeList(type,val,liststack);
        name = rec.name;
        val = rec.val;
      }

      if (type === TOKEN_LIST_ITEM) {
        var rec = tokenizeListItem(type,val,liststack);
        name = rec.name;
        val = rec.val;
      }


      if (type === TOKEN_DESCRIPTION) {
        var rec = tokenizeList(type,val,liststack);
        name = rec.name;
        val = rec.val;
      }

      if (type === TOKEN_INDENT) {
        var rec = tokenizeList(type,val,liststack);
        name = rec.name;
        val = rec.val;
      }
      if (type === TOKEN_HEADER) {
        // in sections take care that the all lists are closed before headers
        var rec = tokenizeSection(type,val,liststack);
        name = rec.name;
        val = rec.val;
      }

      if (type === TOKEN_BF_IT) {
        //alert("tokenize TOKEN_BF_IT");
        var rec = tokenizeFormat(type,val);
        type = rec.type;
        name = rec.name;
        val = rec.val;
        //alert("TOKEN_BF="+val);
      }

      if (type === TOKEN_IT) {
        name = "i";
        //alert("TOKEN_IT="+val);
      }

			if (type === TOKEN_NEWLINE) {
				name = '#newline';
			}

			// Treat all tokens without a name and
			// all unknown MediaWikis as content
			if (!name || ((type === TOKEN_OPEN || type === TOKEN_CLOSE) &&
				!mediawikiHandlers[name])) {

				type = TOKEN_CONTENT;
				name = '#';
			}

			return new TokenizeToken(type, name, val, attrs);
		}

    /**
    * Create a token for a List - :indent, #enumerate, *itemize
    *
    * @param {string} type
    * @param {string} val
    * @return {Object}
    * @private
    */

    function tokenizeFormat(type, val) {
      var name;
      switch (val) {
        case "'''":
          type = "format";
          name = "b"
        break;
        case "''":
            type = "format";
            name = "i";
        break;
        default:
          type = "content";
          name = "#"
      };
      return {
            type: type,
            name: name,
            val: val
          };
    }


    function get_lastlist(liststack) {
      var lastlist;
      if (liststack.length > 0) {
        lastlist = liststack[liststack.length-1];
      } else {
        lastlist = "x0"
      }
      return lastlist;
    }

    /**
    * Create a token for a List - :indent, #enumerate, *itemize
    *
    * @param {string} type
    * @param {string} val
    * @return {Object}
    * @private
    */

    function tokenizeList(type, val, liststack) {
      liststack = liststack || [];
      var listname = "undefinedlist";
      if (val && val.length > 0) {
        var found = val.match(REGEX_LIST);
        var listchars = "";
        if (found) {
          listchars = found[0];
          // remove non-list characters from listchars
          listchars = listchars.replace(/[^\*:#;]/g,"");
          //alert("sceditor/formats/mediawiki.js:1356 - listchars='"+listchars+"'");
        }
        val = val.replace(REGEX_LIST,"");
        val = val.trim();
        // val contains now the rest of the line without the listchars
        var level = listchars.length;
        var char = listchars.substr(listchars.length-1,1);
        //alert("sceditor/formats/mediawiki.js:1362 - char='"+char+"'");
        switch (char) {
          case ":":
            // indent can be used also in description list
            listname = TOKEN_INDENT
          break;
          case ";":
              listname = "dl"
          break;
          case "*":
            listname = "ul"
          break;
          case "#":
            listname = "ol"
          break;
          default:
            //listname = char
        }
      };
      return {
            type: type,
            //listchars: listchars,
            level: level,
            name: listname+level,
            val: listchars
          };
    }

    /* Expand Token List ITEM
    {
            "type": "open",
            "name": "li",
            "val": "<li>",
            "attrs": {},
            "children": [],
            "closing": null
        },
        {
            "type": "content",
            "name": "#",
            "val": "jkalsda",
            "attrs": {},
            "children": [],
            "closing": null
        },
        {
            "type": "close",
            "name": "li",
            "val": "[/li]",
            "attrs": {},
            "children": [],
            "closing": null
        }
    */
    function get_level(token) {
      var level = 0;
      if (token) {
          if (token.val) {
            level = token.val.length
          } else {
            console.warn("get_level(token) - token.val is undefined - token="+JSON.stringify(token,null,4));
          }
      } else {
        console.error("get_level(token) - Token is undefined");
      }
      return level;
    }

    function get_listtag(token) {
      var tag = "undefined";
      if (token) {
          if (token.name) {
            var name = token.name;
            name = name.replace(/[^A-Za-z]/g,"");
            if (name) {
              tag = name;
            } else {
              console.error("get_level(token) - token.name='"+token.name+"' contains no non-integer characters");
            }
          } else {
            console.error("get_level(token) - token.name is undefined");
          }
        } else {
          console.error("get_level(token) - Token is undefined");
        }
      return tag;
    }

    function createExpandTag(type,name,val) {
      if (type === TOKEN_OPEN) {
        val = "<"+name+">";
      } else {
        if (type == TOKEN_CLOSE ) {
          val = "</"+name+">";
        }
      }
      return {
           "type": type,
           "name": name,
           "val": val,
           "attrs": {},
           "children": [],
           "closing": null
       };

    }

    function push4stack(stack,type,list,tag,level) {
      stack.type.push(type);
      stack.list.push(list);
      stack.tag.push(tag);
      stack.level.push(level);
    }

    function pop4stack(stack) {
      var type = "undef4type";
      var list = "undef4list";
      var tag = "undef4tag";
      var level = 0;
      if (stack.type.length > 0) {
        type = stack.type.pop();
        list = stack.list.pop();
        tag = stack.tag.pop();
        level = stack.level.pop();
      }
      return {
        type: type,
        list: list,
        tag: tag,
        level: level
      };
    }

    function last4stack(stack) {
      var type = "undef4type";
      var list = "undef4list";
      var tag = "undef4tag";
      var level = 0;
      if (stack.type.length > 0) {
        type = stack.type[stack.type.length-1];
        list = stack.list[stack.type.length-1];
        tag = stack.tag[stack.type.length-1];
        level = stack.level[stack.type.length-1];
      }
      return {
        type: type,
        list: list,
        tag: tag,
        level: level
      };
    }

    function close4level(stack,level,tokenlist) {
      var s = last4stack(stack);
      var t = tokenlist
      //alert("s.level="+s.level+" compare with level="+level+" token.type='"+s.type+"'");
      //if (s.level > level) alert("BEFORE close4level() - tokenlist.length="+tokenlist.length);
      //if (s.level > level) alert("close4level(stack,"+level+",tokenlist) s.level="+s.level+" ");
      while ((s.level > level) && (stack.tag.length > 0)) {
        s = pop4stack(stack);
        // push the close tag
        //alert("sceditor/formats/mediawiki.js_1655 - tokenlist.length="+tokenlist.length);
        //alert("close4stack(level="+level+") stack.tag=["+stack.tag.join(",")+"] closed s="+JSON.stringify(s,null,4));
        tokenlist.push(createExpandTag(TOKEN_CLOSE,s.tag,s.tag+s.level));
      }
      //if (s.level > level) alert("AFTER close4level() - tokenlist.length="+tokenlist.length);
      return s;
    }

    /*
    var vCount = 0; // counter for unique IDS

    function get_unique_id(pPrefix) {
        pPrefix = pPrefix || "T";
        var timeInMs = Date.now();
        vCount++;
        var vID = pPrefix + timeInMs + "C" + vCount;
        //console.log("Editor ID created '" + vID + "'");
        return vID;
    }
    */

    function expandTokenList(tokens) {
      var tokenlist = [];
      var mathstack = [];
      var stack = {
        type:  [],
        list:  [],
        tag:  [],
        level: [],
        isopen: {
          "b":false,
          "strong": false,
          "i":false
        }
      }
      var s = {
        type:"content",
        list: "-",
        tag: "-",
        level: 0
      };
      var sprev = {
        type:"content",
        list: "-",
        tag: "-",
        level: 0
      };
      var sprev4closed = {
        type:"content",
        list: "-",
        tag: "-",
        level: 0
      };
      var listtag = "-";
      var listtype = "-";
      var listname = "-";
      var listlevel = 0;
      var dlprev;
      //alert("START - expandTokenList()")
      //tokenlist = tokens; // remove later
      var i = 0;
      //alert("sceditor/formats/mediawiki.js:1790 - stack.tag="+JSON.stringify(stack.tag));
      while (i < tokens.length) {
        var t = tokens[i];
        s.type = t.type;
        sprev = last4stack(stack);
        //alert("sceditor/formats/mediawiki.js:1671\nstack.tag=["+stack.tag.join(",")+"]");
        //alert("stack.tag=["+stack.tag.join(",")+"] tag='"+t.name+"' val='"+t.val+"'");
        //alert("expandTokenList(tokens) tokens["+i+"].type="+t.type+" tokens.length="+tokens.length+" tokenlist.length="+tokenlist.length);
        //alert("switch t.type='"+t.type+"' sprev.type='"+sprev.type+"' t.val='"+t.val+"'");
        switch (t.type) {
          case TOKEN_DESCRIPTION:
            //alert("sceditor/formats/mediawiki.js:2413 - TOKEN_DESCRIPTION - level="+s.level+ " stack.tag=["+stack.tag.join(",")+"] tag='"+t.name+"' val='"+t.val+"'")
            console.log("sceditor/formats/mediawiki.js:2413 - TOKEN_DESCRIPTION - level="+s.level+ " stack.tag=["+stack.tag.join(",")+"] tag='"+t.name+"' val='"+t.val+"'")
            // means that listchar ";" e.g.  "; title 1"
            s.level = get_level(t);
            s.tag   = get_listtag(t);
            s.list  = t.name;
            close4level(stack,s.level,tokenlist);
            sprev = last4stack(stack);
            // now all environments with a higher level are closed
            console.log("sceditor/formats/mediawiki.js:1572 - level="+s.level);
            // check if token description starts a new list
            if (sprev.type == TOKEN_DESCRIPTION_TITLE) {
              // continue discription list <dl> with new title <dt>
              //close description title
              dlprev = pop4stack(stack);
              // close previous DT tag
              tokenlist.push(createExpandTag(TOKEN_CLOSE,"dt"," "));
            } else if (sprev.type == TOKEN_DESCRIPTION_DATA)  {
              // continue discription list <dl> with new title <dt>
              // close previous description data
              dlprev = pop4stack(stack);
              tokenlist.push(createExpandTag(TOKEN_CLOSE,"dd"," "));
            } else {
              // open a new description list with "dl" tag
              push4stack(stack,TOKEN_DESCRIPTION,"dl"+s.level,"dl",s.level);
              tokenlist.push(createExpandTag(TOKEN_OPEN, "dl",t.val));
            }
            // in any case open a new description title
            push4stack(stack,TOKEN_DESCRIPTION_TITLE,t.name,"dt",s.level);
            tokenlist.push(createExpandTag(TOKEN_OPEN, "dt",t.val));
          break;
          case TOKEN_INDENT: // ':' indent can be used as <dd> after TOKEN_DESCRIPTION_ITEM
            s.level = get_level(t);
            t.name = "indent"+s.level
            s.tag   = get_listtag(t);
            s.list  = t.name;
            //alert("sceditor/formats/mediawiki.js:2437 - TOKEN_INDENT > DESCRIPTION - level="+s.level+ " stack.tag=["+stack.tag.join(",")+"] tag='"+t.name+"' val='"+t.val+"'")
            //console.log("sceditor/formats/mediawiki.js:2437 - TOKEN_INDENT > DESCRIPTION - level="+s.level+ " stack.tag=["+stack.tag.join(",")+"] tag='"+t.name+"' val='"+t.val+"'")
            //alert("level="+s.level+" for token "+JSON.stringify(t))
            console.log("sceditor/formats/mediawiki.js:1659 - TOKEN_INDENT level="+s.level);
            sprev4closed = close4level(stack,s.level,tokenlist);
            sprev = last4stack(stack);
            // now all environments with a higher level are closed
            if (sprev.type == TOKEN_DESCRIPTION_TITLE) {
              //alert("case TOKEN_INDENT sprev.type('"+sprev.type+"') == TOKEN_DESCRIPTION_TITLE('"+TOKEN_DESCRIPTION_TITLE+"') val='"+t.val+"' s.level="+s.level+" sprev.level="+sprev.level);
              if (s.level == sprev.level) {
                //alert("sprev.type == TOKEN_DESCRIPTION_TITLE '"+t.val+"'")
                // close previous description item
                sprev = pop4stack(stack);
                //alert("sceditor/formats/mediawiki.js:2463 close DT "+sprev.type+" "+sprev.tag+" stack.tags=["+stack.tag.join(",")+"]");
                tokenlist.push(createExpandTag(TOKEN_CLOSE,sprev.tag,t.val));
                // open new description explanation item <dd>
                push4stack(stack,TOKEN_DESCRIPTION_DATA,"dd"+s.level,"dd",s.level);
                tokenlist.push(createExpandTag(TOKEN_OPEN, "dd",t.val));
              } else {
                // this is an indent with a highler level
                // open description list "dl"
                push4stack(stack,TOKEN_INDENT_LIST,"dl"+s.level,"dl",s.level);
                tokenlist.push(createExpandTag(TOKEN_OPEN, "dl",t.val));
                // open an indent - created as dd-tag
                push4stack(stack,TOKEN_INDENT,"dd"+s.level,"dd",s.level);
                tokenlist.push(createExpandTag(TOKEN_OPEN, "dd",t.val));
              }
            } else if (sprev.type == TOKEN_INDENT) {
               if (s.level == sprev.level) {
                  //new indent on same level
                  // close previous indent tag
                  sprev = pop4stack(stack);
                  tokenlist.push(createExpandTag(TOKEN_CLOSE,sprev.tag,t.val));
                  // open new indent tag
                  push4stack(stack,TOKEN_INDENT,"dd"+s.level,"dd",s.level);
                  tokenlist.push(createExpandTag(TOKEN_OPEN, "dd",t.val));
              } else {
                // add a nested indentlist
                push4stack(stack,TOKEN_INDENT_LIST,"dl"+s.level,"dl",s.level);
                tokenlist.push(createExpandTag(TOKEN_OPEN, "dl",t.val));
                // open an indent - created as dd-tag
                push4stack(stack,TOKEN_INDENT,"dd"+s.level,"dd",s.level);
                tokenlist.push(createExpandTag(TOKEN_OPEN, "dd",t.val));
              }
            } else  if (sprev.type == TOKEN_LIST_ITEM) {
                // indent of same level as previous list e.g. as "#:" or "#*"
                // can be interpreted as newline of ul (bullet list) environment
                /*
                  {
                    "type": "newline",
                    "name": "#newline",
                    "val": "\n",
                    "attrs": {},
                    "children": [],
                    "closing": null
                  }
                */
                if (s.level == sprev.level) {
                  /* add a line break on same level
                  {
                      "type": "content",
                      "name": "#",
                      "val": "<br/>",
                      "attrs": {},
                      "children": [],
                      "closing": null
                  }
                 */
                 tokenlist.push(createExpandTag(TOKEN_CONTENT,"#","<br/>"));
               } else {
                 // nested indent
                 // add a nested indentlist
                 push4stack(stack,TOKEN_INDENT_LIST,"dl"+s.level,"dl",s.level);
                 tokenlist.push(createExpandTag(TOKEN_OPEN, "dl",t.val));
                 // open an indent - created as dd-tag
                 push4stack(stack,TOKEN_INDENT,"dd"+s.level,"dd",s.level);
                 tokenlist.push(createExpandTag(TOKEN_OPEN, "dd",t.val));
               }
                // do not pop4stack just append a newline
            } else {
                  // open a new INDENT_LIST
                  //alert("sceditor/formats/mediawiki.js:2512 - Indent List with ':' with token="+JSON.stringify(t,null,4));
                  push4stack(stack,TOKEN_INDENT_LIST,"dl"+s.level,"dl",s.level);
                  tokenlist.push(createExpandTag(TOKEN_OPEN, "dl", t.val));
                  // open a new INDENT item
                  push4stack(stack,TOKEN_INDENT,"dd"+s.level,"dd",s.level);
                  tokenlist.push(createExpandTag(TOKEN_OPEN, "dd",t.val));
            }
          break;
          case TOKEN_LIST:
            // handle UL or OL environment
            // contains the current record for the list
            s.level = get_level(t);
            s.tag   = get_listtag(t);
            s.list  = t.name;
            console.log("sceditor/formats/mediawiki.js:1578 - token.name='"+t.name+"' level="+s.level);
            if (sprev.list == t.name) {
              // i.e. "ul1" was previous item - same item "ul1" on same level 1
              // due to existing previous list item - close just previous <li>
              sprev = pop4stack(stack);
              tokenlist.push(createExpandTag(TOKEN_CLOSE,sprev.tag,t.val));
              console.log("sceditor/formats/mediawiki.js:1578 - pop4stack()="+JSON.stringify(sprev));
              // new list item "li" of same list name "ul1"
              tokenlist.push(createExpandTag(TOKEN_OPEN,"li",t.val));
              push4stack(stack,TOKEN_LIST_ITEM,t.name,"li",s.level);
            } else {
              // we itemize over another list type
              // close all environments with a higher level
              close4level(stack,s.level-1,tokenlist);
              sprev = last4stack(stack);
              // with closing sprev.level < s.level
              // (1) close current list
              // (2) different list on same level
              // (3) nested new list on higher level
              tokenlist.push(createExpandTag(TOKEN_OPEN,s.tag,t.val));
              push4stack(stack,TOKEN_LIST_ITEM,t.name,s.tag,s.level);
              tokenlist.push(createExpandTag(TOKEN_OPEN,"li",t.val));
              push4stack(stack,TOKEN_LIST_ITEM,t.name,"li",s.level);
              // update list level and listtag
            };
            //tokenlist.push(t);
          break;

          //case TOKEN_BF_IT: //i.e. "boldfaceitalics":
          case TOKEN_FORMAT: //i.e. "format":
            //console.log("sceditor/formats/mediawiki.js:2604 - TOKEN_BF_IT='"+TOKEN_BF_IT+"' t.name='"+t.name+"'");
            if (stack.isopen[t.name] == true)  {
              // close opened tag
              tokenlist.push(createExpandTag(TOKEN_CLOSE,t.name,t.val));
              stack.isopen[t.name] = false;
            } else {
              // tag is closed or not defined - then open tag
              tokenlist.push(createExpandTag(TOKEN_OPEN,t.name,t.val));
              stack.isopen[t.name] = true;
            }
          break;
          case TOKEN_NEWLINE:
            //alert("newline level=0- close4level()-CALL");
            close4level(stack,0,tokenlist);
            tokenlist.push(t);
          break;
          case TOKEN_OPEN:
            if (t.name == TOKEN_MATH) {
              if (t.attrs["display"] && t.attrs["display"] == "block") {
                //t.name = TOKEN_MATH_BLOCK_OPEN;
                //mathstack.push[TOKEN_MATH_BLOCK];
                //t.name = TOKEN_MATH_BLOCK;
              } else {
                //t.name = TOKEN_MATH_INLINE_OPEN;
                t.attrs["display"] = "inline";
                //mathstack.push[TOKEN_MATH_INLINE];
                //t.name = TOKEN_MATH_INLINE;
              };
              // push TOKEN_MATH_INLINE or TOKEN_MATH_BLOCK to mathstack
              mathstack.push[t.name];
              t.attrs["id"] ="MA" + get_unique_id();
              t.val = "<" + t.name + " id=\"" + t.attrs["id"] + "\" display=\"" + t.attrs["display"] + "\">"
              /*
              i++;
              while ((i < tokens.length) && (tokens[i].type !== TOKEN_CLOSE)) {
                t.val += tokens[i].val;
                i++;
              }
              t.val += "</math>";
              //if ((i < tokens.length) && (tokens[i].type == TOKEN_CLOSE)) {}
              */
              tokenlist.push(t);
            } else {
              tokenlist.push(t);
            }
          break;
          case TOKEN_CLOSE:
            var closetag = t.val.toLowerCase();
            //closetag = close.replace(/\s/g,"");
            //if (t.name == TOKEN_MATH) {
            if (closetag == "</math>") {
              //t["name"] = mathstack.pop();
              console.log("sceditor/formats/mediawiki.js:1997 - close-tag["+i+"] val='"+t.val+"'")
            }
            tokenlist.push(t);
          break;
          default:
            tokenlist.push(t);
        }
        // increment index
        i++;
      }
      // close all open lists
      console.log("sceditor/formats/mediawiki.js:1874 - closing all open tags for stack.tag=["+stack.tag.join(",")+"]");
      //alert("BEFORE close4level() - tokenlist.length="+tokenlist.length);
      close4level(stack,-1,tokenlist);
      //alert("AFTER close4level() - tokenlist.length="+tokenlist.length);
      //alert("STOP - expandTokenList()")
      return tokenlist;
      //return tokens;
    }

    /**
     * Create a token for a section
     *
     * @param {string} type
     * @param {string} val
     * @return {Object}
     * @private
     */
    function tokenizeSection(type, val) {
      var level = 0;
      var line = val.replace(/^[^=]/g,"");
      line = line.trim();
      var title = "";
      if (line.match(/^======/)!=null && line.match(/======$/)!=null) {
        level = 6;
        title = line.substring(level,line.length-level);
      } else if (line.match(/^=====/)!=null && line.match(/=====$/)!=null) {
        level = 5;
        title = line.substring(level,line.length-level);
      } else if (line.match(/^====/)!=null && line.match(/====$/)!=null) {
        level = 4;
        title = line.substring(level,line.length-level);
      } else if (line.match(/^===/)!=null && line.match(/===$/)!=null) {
        level = 3;
        title = line.substring(level,line.length-level);
      } else if (line.match(/^==/)!=null && line.match(/==$/)!=null) {
        level = 2;
        title = line.substring(level,line.length-level);
      } else if (line.match(/^=/)!=null && line.match(/=$/)!=null) {
        level = 1;
        title = line.substring(level,line.length-level);
      }
      return {
        name:"h"+level,
        val: title
      };
    };

		/**
		 * Extracts the individual attributes from a string containing
		 * all the attributes.
		 *
		 * @param {string} attrs
		 * @return {Object} Assoc array of attributes
		 * @private
		 */
		function tokenizeAttrs(attrs) {
			var	matches,
				/*
				([^\s=]+)				Anything that's not a space or equals
				=						Equals sign =
				(?:
					(?:
						(["'])					The opening quote
						(
							(?:\\\2|[^\2])*?	Anything that isn't the
												unescaped opening quote
						)
						\2						The opening quote again which
												will close the string
					)
						|				If not a quoted string then match
					(
						(?:.(?!\s\S+=))*.?		Anything that isn't part of
												[space][non-space][=] which
												would be a new attribute
					)
				)
				*/
				attrRegex = /([^\s=]+)=(?:(?:(["'])((?:\\\2|[^\2])*?)\2)|((?:.(?!\s\S+=))*.))/g,
				ret       = {};

			// if only one attribute then remove the = from the start and
			// strip any quotes
			if (attrs.charAt(0) === '=' && attrs.indexOf('=', 1) < 0) {
				ret.defaultattr = _stripQuotes(attrs.substr(1));
			} else {
				if (attrs.charAt(0) === '=') {
					attrs = 'defaultattr' + attrs;
				}

				// No need to strip quotes here, the regex will do that.
				while ((matches = attrRegex.exec(attrs))) {
					ret[lower(matches[1])] =
						_stripQuotes(matches[3]) || matches[4];
				}
			}

			return ret;
		}

		/**
		 * Parses a string into an array of MediaWikis
		 *
		 * @param  {string}  str
		 * @param  {boolean} preserveNewLines If to preserve all new lines, not
		 *                                    strip any based on the passed
		 *                                    formatting options
		 * @return {array}                    Array of MediaWiki objects
		 * @memberOf MediaWikiParser.prototype
		 */
		base.parse = function (str, preserveNewLines) {
      //this parses the HTML source tags
      console.log("sceditor/formats/mediawiki.js:2748 - parse(str) str='"+str+"'")
      //alert("sceditor/formats/mediawiki.js:2748 - parse(str) str='"+str+"'")
      var tokens = base.tokenize(str);
      var tokenlist = expandTokenList(tokens);
      console.log("sceditor/formats/mediawiki.js:2771 - str='"+str+"'");
      console.log("sceditor/formats/mediawiki.js:2772 - tokenlist="+JSON.stringify(tokenlist,null,4));
      //alert("preprocessToken4Source()")
			var tokentree  = parseTokens(tokenlist);
      console.log("sceditor/formats/mediawiki.js:2774 - After parseTokens(tokenlist)=tokentree="+JSON.stringify(tokentree,null,4)+" ");
			var opts = base.opts;
      /*
      if (token.children) {
        if (mediawiki.skipLastLineBreak && mediawiki.skipLastLineBreak == true) {
          skipLastLineBreaks(token.children);
        };
        if (mediawiki.allowedChildren) {
          fixAllowedChildren(token.children,mediawiki);
        }
        ret += convertToMediaWikiCode(token.children);
      }
      */
      //normaliseMathToken()

			if (opts.fixInvalidNesting) {
				fixNesting(tokentree);
			}
      // TODO modify cleanup newline for mediawiki syntax
			//normaliseNewLines(tokentree, null, preserveNewLines);

			if (opts.removeEmptyTags) {
				removeEmpty(tokentree);
			}

			return tokentree;
		};

		/**
		 * Checks if an array of TokenizeToken's contains the
		 * specified token.
		 *
		 * Checks the tokens name and type match another tokens
		 * name and type in the array.
		 *
		 * @param  {string}    name
		 * @param  {string} type
		 * @param  {array}     arr
		 * @return {Boolean}
		 * @private
		 */
		function hasTag(name, type, arr) {
			var i = arr.length;

			while (i--) {
				if (arr[i].type === type && arr[i].name === name) {
					return true;
				}
			}

			return false;
		}

		/**
		 * Checks if the child tag is allowed as one
		 * of the parent tags children.
		 *
		 * @param  {TokenizeToken}  parent
		 * @param  {TokenizeToken}  child
		 * @return {Boolean}
		 * @private
		 */
    function isChildAllowed(parent, child) {
      if (parent) {
        if (child) {
          return isChildAllowed4TagName(parent.name, child.name)
        } else {
          console.warn("isChildAllowed(parent,child) - parent <"+parent.name+"> defined but child is not defined");
          return false;
        }
      } else {
        console.log("sceditor/formats/mediawiki.js:2971 - isChildAllowed(parent,child) - parent is not defined - so child is root child");
        return true;
      }
    }

 		function isChildAllowed4TagName(parent_name, child_name) {
			var	parentMediaWiki = {};
      var parentAllAllowed = ["li","td","dt"];
      var allowedChildren;
      if (parent_name) {
        parentMediaWiki = mediawikiHandlers[parent_name];
        allowedChildren = (parentMediaWiki && parentMediaWiki.allowedChildren) || [];
        if (parentAllAllowed.indexOf(parent_name) >= 0) {
          console.log("sceditor/formats/mediawiki.js:2984 - parentAllAllowed");
          return true;
        }
      };
      if (allowedChildren && allowedChildren.indexOf("*") >= 0) {
        // all children are allowed, if mediawikiHandler exists
        if ((child_name == "#") || mediawikiHandlers[child_name]) {
          console.log("sceditor/formats/mediawiki.js:2991 - isChildAllowed4TagName(parent='"+parent_name+"',child='"+child_name+"') ALL Children allowed");
  			  return true;
        }
      }
			if (base.opts.fixInvalidChildren && allowedChildren) {
        //alert("sceditor/formats/mediawiki.js:2784 - isChildAllowed(parent='"+parent_name+"',child='"+child_name+"') fixInvalidChildren");
        var ind = allowedChildren.indexOf(child_name || '#');
        console.log("sceditor/formats/mediawiki.js:2784 - isChildAllowed4TagName(parent='"+parent_name+"',child='"+child_name+"')="+ind);
        return (ind > -1);
			}
			return true;
		}

		// TODO: Tidy this parseTokens() function up a bit.
		/**
		 * Parses an array of tokens created by tokenize()
		 *
		 * @param  {array} toks
		 * @return {array} Parsed tokens
		 * @see tokenize()
		 * @private
		 */
		function parseTokens(toks) {
      console.log("sceditor/formats/mediawiki.js:2859 - parseTokens(toks) - tokenlist="+JSON.stringify(toks,null,4));
      //alert("sceditor/formats/mediawiki.js:2859 - parseTokens(toks) - tokenlist="+JSON.stringify(toks,null,4));
			var	token, mediawiki, curTok, clone, i, next,
				cloned     = [],
				output     = [],
				openTags   = [],
				/** ------------------------------------------
				 * Returns the currently open tag or undefined
				 * @return {TokenizeToken}
				 */
				currentTag = function () {
					return last(openTags);
				},
				/** --------------------------------------------
				 * Adds a tag to either the current tags children
				 * or to the output array.
				 * @param {TokenizeToken} token
				 * @private
				 */
				addTag = function (token) {
					if (currentTag()) {
						currentTag().children.push(token);
					} else {
						output.push(token);
					}
				},
				/** -----------------------------------------
				 * Checks if this tag closes the current tag
				 * @param  {string} name
				 * @return {Void}
				 */
				closesCurrentTag = function (name) {
					return currentTag() &&
						(mediawiki = mediawikiHandlers[currentTag().name]) &&
						mediawiki.closedBy &&
						mediawiki.closedBy.indexOf(name) > -1;
				};

			while ((token = toks.shift())) {
        next = toks[0];
        //console.log("sceditor/formats/mediawiki.js:2860 - parseToken(toks) token="+JSON.stringify(next,null,4));
        //alert("sceditor/formats/mediawiki.js:2860 - parseToken(toks) token="+JSON.stringify(next,null,4));

				/*
				 * Fixes any invalid children.
				 *
				 * If it is an element which isn't allowed as a child of it's
				 * parent then it will be converted to content of the parent
				 * element. i.e.
				 *     [code]Code [b]only[/b] allows text.[/code]
				 * Will become:
				 *     <code>Code [b]only[/b] allows text.</code>
				 * Instead of:
				 *     <code>Code <b>only</b> allows text.</code>
				 */
				// Ignore tags that can't be children
				if (!isChildAllowed(currentTag(), token)) {

					// exclude closing tags of current tag
					if (token.type !== TOKEN_CLOSE || !currentTag() ||
							token.name !== currentTag().name) {
						token.name = '#';
						token.type = TOKEN_CONTENT;
					}
				} else {
          //alert("sceditor/formats/mediawiki.js:2913 - token="+JSON.stringify(next,null,4)+" NO CHILDREN");
        }

				switch (token.type) {
					case TOKEN_OPEN:
            console.log("sceditor/formats/mediawiki.js:2917 - parseToken(toks) TOKEN_OPEN - add next token="+JSON.stringify(next,null,4)+" to mediawikiHandler['"+token.name+"']");
            //alert("sceditor/formats/mediawiki.js:2918 - parseToken(toks) TOKEN_OPEN - add next token="+JSON.stringify(next,null,4)+" to mediawikiHandler['"+token.name+"']");
            // Check it this closes a parent,
						// e.g. for lists\n* one\n* two \nnext text
						if (closesCurrentTag(token.name)) {
							openTags.pop();
						}

						addTag(token);
						mediawiki = mediawikiHandlers[token.name];
            if (!mediawiki) {
              //console.warn("sceditor/formats/mediawiki.js:2897 - parseToken(toks) token="+JSON.stringify(next,null,4)+" mediawikiHandler['"+token.name+"'] not defined");
              console.error("sceditor/formats/mediawiki.js:2879 - parseToken(toks) token="+JSON.stringify(token,null,4)+" mediawikiHandler['"+token.name+"'] NOT DEFINED");

            } else {
              console.log("sceditor/formats/mediawiki.js:2882 - parseToken(toks) token="+JSON.stringify(token,null,4)+" mediawikiHandler['"+token.name+"'] is defined");

            }
						// If this tag is not self closing and it has a closing
						// tag then it is open and has children so add it to the
						// list of open tags. If has the closedBy property then
						// it is closed by other tags so include everything as
						// it's children until one of those tags is reached.
						if (mediawiki && !mediawiki.isSelfClosing &&
							(mediawiki.closedBy ||
								hasTag(token.name, TOKEN_CLOSE, toks))) {
							openTags.push(token);
              console.log("sceditor/formats/mediawiki.js:2894 - parseToken(toks) next token="+JSON.stringify(next,null,4)+" mediawikiHandler['"+next.name+"'] adds to subtree of <"+token.name+">.");
            } else if (!mediawiki || !mediawiki.isSelfClosing) {
							token.type = TOKEN_CONTENT;
              console.log("sceditor/formats/mediawiki.js:2897 - parseToken(toks) next token="+JSON.stringify(next,null,4)+" mediawikiHandler['"+next.name+"'] is content.");
      			}
						break;

					  case TOKEN_CLOSE:
              console.log("sceditor/formats/mediawiki.js:2902 - parseToken(toks) TOKEN_CLOSE - token="+JSON.stringify(token,null,4)+" mediawikiHandler['"+token.name+"'] ");
              //alert("sceditor/formats/mediawiki.js:2903 - parseToken(toks) TOKEN_CLOSE - token="+JSON.stringify(token,null,4)+" mediawikiHandler['"+token.name+"'] ");
              // check if this closes the current tag,
						  // e.g. [/list] would close an open [*]
						  if (currentTag() && token.name !== currentTag().name &&
							      closesCurrentTag('/' + token.name)) {

							   openTags.pop();
						  }

						   // If this is closing the currently open tag just pop
						   // the close tag off the open tags array
						   if (currentTag() && token.name === currentTag().name) {
							    currentTag().closing = token;
							    openTags.pop();
                  // If this is closing an open tag that is the parent of
      						// the current tag then clone all the tags including the
      						// current one until reaching the parent that is being
      						// closed. Close the parent and then add the clones back
      						// in.

						   } else if (hasTag(token.name, TOKEN_OPEN, openTags)) {

							     // Remove the tag from the open tags
							     while ((curTok = openTags.pop())) {
                     // If it's the tag that is being closed then
     								// discard it and break the loop.
     								if (curTok.name === token.name) {
     									curTok.closing = token;
     									break;
     								}
                     if (curTok && curTok["clone"]) {
                       // Otherwise clone this tag and then add any
                       // previously cloned tags as it's children
                       clone = curTok.clone();

                       if (cloned.length) {
                         clone.children.push(last(cloned));
                       }

                       cloned.push(clone);
                     } else {
                       console.error("curTok has no clone() method - curTok="+JSON.stringify(curTok,null,4));
                     }

     							}

     							// Place block linebreak before cloned tags
     							if (next && next.type === TOKEN_NEWLINE) {
     								mediawiki = mediawikiHandlers[token.name];
     								if (mediawiki && mediawiki.isInline === false) {
     									addTag(next);
     									toks.shift();
     								}
     							}

     							// Add the last cloned child to the now current tag
     							// (the parent of the tag which was being closed)
     							addTag(last(cloned));

     							// Add all the cloned tags to the open tags list
     							i = cloned.length;
     							while (i--) {
     								openTags.push(cloned[i]);
     							}

     							cloned.length = 0;

     						// This tag is closing nothing so treat it as content
     						} else {
     							token.type = TOKEN_CONTENT;
     							addTag(token);
     						}
     			break;
          case TOKEN_HEADER:
                /*
                {
                  "type": "header",
                  "name": "h2",
                  "val": "Header 1",
                  "attrs": {},
                  "children": [],
                  "closing": null
                },
                {
                  "type": "header",
                  "name": "h3",
                  "val": "Header2",
                  "attrs": {},
                  "children": [],
                  "closing": null
                },
                */
              addTag(token);
          break;

          case TOKEN_NEWLINE:
						// handle things like
						//     [*]list\nitem\n[*]list1
						// where it should come out as
						//     [*]list\nitem[/*]\n[*]list1[/*]
						// instead of
						//     [*]list\nitem\n[/*][*]list1[/*]
						if (currentTag() && next && closesCurrentTag(
							(next.type === TOKEN_CLOSE ? '/' : '') +
							next.name) ) {
							// skip if the next tag is the closing tag for
							// the option tag, i.e. [/*]
							if (!(next.type === TOKEN_CLOSE &&
								next.name === currentTag().name)) {
								mediawiki = mediawikiHandlers[currentTag().name];

								if (mediawiki && mediawiki.breakAfter) {
									openTags.pop();
								} else if (mediawiki &&
									mediawiki.isInline === false &&
									base.opts.breakAfterBlock &&
									mediawiki.breakAfter !== false) {
									openTags.pop();
								}
							}
						}

						addTag(token);
						break;

					default: // content
						addTag(token);
						break;
				}
			}

			return output;
		}

		/**
		 * Normalise all new lines
		 *
		 * Removes any formatting new lines from the MediaWiki
		 * leaving only content ones. I.e. for a list:
		 *
		 *   beginning of list
		 *   * list item one
		 *   : with a line break
		 *   * list item two
		 *   end of list
		 *
		 * would become
		 *
		 *   beginning of list
		 *   * list item one <br/>
		 *   * list item two
		 *   end of list
     *
		 * Which makes it easier to convert to HTML or add
		 * the formatting new lines back in when converting
		 * back to MediaWiki
		 *
		 * @param  {array} children
		 * @param  {TokenizeToken} parent
		 * @param  {boolean} onlyRemoveBreakAfter
		 * @return {void}
		 */
		function normaliseNewLines(children, parent, onlyRemoveBreakAfter) {
			var	token, left, right, parentMediaWiki, mediawiki,
				removedBreakEnd, removedBreakBefore, remove;
			var childrenLength = children.length;
			// TODO: this function really needs tidying up
			if (parent) {
				parentMediaWiki = mediawikiHandlers[parent.name];
			}

			var i = childrenLength;
			while (i--) {
				if (!(token = children[i])) {
					continue;
				}

				if (token.type === TOKEN_NEWLINE) {
					left   = i > 0 ? children[i - 1] : null;
					right  = i < childrenLength - 1 ? children[i + 1] : null;
					remove = false;

					// Handle the start and end new lines
					// e.g. [tag]\n and \n[/tag]
					if (!onlyRemoveBreakAfter && parentMediaWiki &&
						parentMediaWiki.isSelfClosing !== true) {
						// First child of parent so must be opening line break
						// (breakStartBlock, breakStart) e.g. [tag]\n
						if (!left) {
							if (parentMediaWiki.isInline === false &&
								base.opts.breakStartBlock &&
								parentMediaWiki.breakStart !== false) {
								remove = true;
							}

							if (parentMediaWiki.breakStart) {
								remove = true;
							}
						// Last child of parent so must be end line break
						// (breakEndBlock, breakEnd)
						// e.g. \n[/tag]
						// remove last line break (breakEndBlock, breakEnd)
						} else if (!removedBreakEnd && !right) {
							if (parentMediaWiki.isInline === false &&
								base.opts.breakEndBlock &&
								parentMediaWiki.breakEnd !== false) {
								remove = true;
							}

							if (parentMediaWiki.breakEnd) {
								remove = true;
							}

							removedBreakEnd = remove;
						}
					}

					if (left && left.type === TOKEN_OPEN) {
						if ((mediawiki = mediawikiHandlers[left.name])) {
							if (!onlyRemoveBreakAfter) {
								if (mediawiki.isInline === false &&
									base.opts.breakAfterBlock &&
									mediawiki.breakAfter !== false) {
									remove = true;
								}

								if (mediawiki.breakAfter) {
									remove = true;
								}
							} else if (mediawiki.isInline === false) {
								remove = true;
							}
						}
					}

					if (!onlyRemoveBreakAfter && !removedBreakBefore &&
						right && right.type === TOKEN_OPEN) {

						if ((mediawiki = mediawikiHandlers[right.name])) {
							if (mediawiki.isInline === false &&
								base.opts.breakBeforeBlock &&
								mediawiki.breakBefore !== false) {
								remove = true;
							}

							if (mediawiki.breakBefore) {
								remove = true;
							}

							removedBreakBefore = remove;

							if (remove) {
								children.splice(i, 1);
								continue;
							}
						}
					}

					if (remove) {
						children.splice(i, 1);
					}

					// reset double removedBreakBefore removal protection.
					// This is needed for cases like \n\n[\tag] where
					// only 1 \n should be removed but without this they both
					// would be.
					removedBreakBefore = false;
				} else if (token.type === TOKEN_OPEN) {
					normaliseNewLines(token.children, token,
						onlyRemoveBreakAfter);
				}
			}
		}

		/**
		 * Fixes any invalid nesting.
		 *
		 * If it is a block level element inside 1 or more inline elements
		 * then those inline elements will be split at the point where the
		 * block level is and the block level element placed between the split
		 * parts. i.e.
		 *     [inline]A[blocklevel]B[/blocklevel]C[/inline]
		 * Will become:
		 *     [inline]A[/inline][blocklevel]B[/blocklevel][inline]C[/inline]
		 *
		 * @param {array} children
		 * @param {array} [parents] Null if there is no parents
		 * @param {boolea} [insideInline] If inside an inline element
		 * @param {array} [rootArr] Root array if there is one
		 * @return {array}
		 * @private
		 */
		function fixNesting(children, parents, insideInline, rootArr) {
			var	token, i, parent, parentIndex, parentParentChildren, right;

			var isInline = function (token) {
				var mediawiki = mediawikiHandlers[token.name];

				return !mediawiki || mediawiki.isInline !== false;
			};

			parents = parents || [];
			rootArr = rootArr || children;

			// This must check the length each time as it can change when
			// tokens are moved to fix the nesting.
			for (i = 0; i < children.length; i++) {
				if (!(token = children[i]) || token.type !== TOKEN_OPEN) {
					continue;
				}

				if (insideInline && !isInline(token)) {
					// if this is a blocklevel element inside an inline one then
					// split the parent at the block level element
					parent = last(parents);
					right  = parent.splitAt(token);

					parentParentChildren = parents.length > 1 ?
						parents[parents.length - 2].children : rootArr;

					// If parent inline is allowed inside this tag, clone it and
					// wrap this tags children in it.
					if (isChildAllowed(token, parent)) {
						var clone = parent.clone();
						clone.children = token.children;
						token.children = [clone];
					}

					parentIndex = parentParentChildren.indexOf(parent);
					if (parentIndex > -1) {
						// remove the block level token from the right side of
						// the split inline element
						right.children.splice(0, 1);

						// insert the block level token and the right side after
						// the left side of the inline token
						parentParentChildren.splice(
							parentIndex + 1, 0, token, right
						);

						// If token is a block and is followed by a newline,
						// then move the newline along with it to the new parent
						var next = right.children[0];
						if (next && next.type === TOKEN_NEWLINE) {
							if (!isInline(token)) {
								right.children.splice(0, 1);
								parentParentChildren.splice(
									parentIndex + 2, 0, next
								);
							}
						}

						// return to parents loop as the
						// children have now increased
						return;
					}

				}

				parents.push(token);

				fixNesting(
					token.children,
					parents,
					insideInline || isInline(token),
					rootArr
				);

				parents.pop();
			}
		}

		/**
		 * Removes any empty MediaWikis which are not allowed to be empty.
		 *
		 * @param {array} tokens
		 * @private
		 */
		function removeEmpty(tokens) {
			var	token, mediawiki;

			/**
			 * Checks if all children are whitespace or not
			 * @private
			 */
			var isTokenWhiteSpace = function (children) {
				var j = children.length;

				while (j--) {
					var type = children[j].type;

					if (type === TOKEN_OPEN || type === TOKEN_CLOSE) {
						return false;
					}

					if (type === TOKEN_CONTENT &&
						/\S|\u00A0/.test(children[j].val)) {
						return false;
					}
				}

				return true;
			};

			var i = tokens.length;
			while (i--) {
				// So skip anything that isn't a tag since only tags can be
				// empty, content can't
				if (!(token = tokens[i]) || token.type !== TOKEN_OPEN) {
					continue;
				}

				mediawiki = mediawikiHandlers[token.name];

				// Remove any empty children of this tag first so that if they
				// are all removed this one doesn't think it's not empty.
				removeEmpty(token.children);

				if (isTokenWhiteSpace(token.children) && mediawiki &&
					!mediawiki.isSelfClosing && !mediawiki.allowsEmpty) {
					tokens.splice.apply(tokens, [i, 1].concat(token.children));
				}
			}
		}

    function remove_after_header(token) {
      var ret = false;
      if (token.type == TOKEN_NEWLINE) {
        ret = true;
      }
      if ( (token.type == "content") && (token.name == "#")  && (token.val == " ") ){
        ret = true;
      }
      return ret;
    }

    function getMathDisplay(token) {
      var vDisplay = "inline";
      /*
      {
        "type": "open",
        "name": "math",
        "val": "<math id=\"MAT1688363969981C3\" display=\"block\">",
        "attrs": {
            "display": "block",
            "id": "MAT1688363969981C3"
        },
      */
      if (token) {
        if ((token.type == TOKEN_OPEN) && (token.name == "math")) {
          if (token.attrs && token.attrs.display) {
            vDisplay = token.attrs.display
          }
        }
      } else {
        console.error("getMathDisplay(token) token is undefined");
      }
      return vDisplay;
    }

    function remove_leading_newlines(tokentree) {
      // tokentree is an array of objects that can have children
      while ((tokentree.length > 0) && (tokentree[0].type == TOKEN_NEWLINE)) {
        tokentree.splice(0,1); // second parameter 1 means "delete one element only"
        //alert("remove leading newline");
      }
    }

    function sanitize_tokentree(tokens,outformat) {
      console.log("sceditor/formats/mediawiki.js:3372 - BEFORE sanitize_tokentree(tokens) tokens="+JSON.stringify(tokens,null,4));
      var tokenlist = [];
      var mathstack = [];
      var i = 1;
      if (tokens.length > 0) {
        // remove leading newlines and empty content
        remove_leading_newlines(tokens);
        fixAllowedChildren(tokens);
        //allowedChildren
        var previousToken = tokens[i-1];
        tokenlist.push(previousToken);
        while (i  < tokens.length) {
          // remove newlines after header tags
          // check if current token is a newline
          // check is token pair is not header>newline
          /*
          {
            "type": "header",
            "name": "h4",
            "val": "Header 3",

          },
          {
            "type": "newline",
            "name": "#newline",
            "val": "\n",

          },
          */
          if ( (tokens[i].type == TOKEN_OPEN)) {
            switch (tokens[i].name) {
              case TOKEN_MATH:
                if (getMathDisplay(tokens[i]) == "block") {
                  tokens[i].name == TOKEN_MATH_BLOCK;
                } else {
                  tokens[i].name == TOKEN_MATH_INLINE;
                }
              break;
              default:

            }
          }

          if ( (previousToken.type == TOKEN_HEADER)) {
            while ( (tokens.length > i) &&
                    (remove_after_header(tokens[i]) == true) ) {
                console.log("sceditor/formats/mediawiki.js:2038 sanitize_tokentree() remove newline after header '"+previousToken.namne+"' with title '"+previousToken.val+"'");
                tokens.splice(i,1);
            }
            // now all newlines after token 'header' are gone
          }
          tokenlist.push(tokens[i]);
          // set new previousToken
          previousToken = tokens[i];
          i++;
         }

      }
      return tokenlist;
    }

    function replaceStringReverse(pString,pReplace,pSearch)
    //###### replaces in the string "pString" multiple substrings "pSearch" by "pReplace"
    {
    	return replaceString(pString,pSearch,pReplace);
    }

    function replaceString(pString,pSearch,pReplace)
    //###### replaces in the string "pString" multiple substrings "pSearch" by "pReplace"
    {
    	//console.log("string.js - replaceString() "+typeof(pString));
    	var vString = pString || "";
    	var vSearch = pSearch || "";
    	var vReturnString = '';
    	if (typeof(pString) != "string") {
    		pString = "";
    	} else if (vSearch == "") {
    		console.log("replaceString(pString,pSearch,pReplace) pSearch undefined");
    	} else if (vString != '') {
    		pString = vString;
    		var vHelpString = '';
        var vN = vString.indexOf(pSearch);
    		while (vN >= 0) {
    			if (vN > 0)
    				vReturnString += pString.substring(0, vN);
    				vReturnString += pReplace;
            if (vN + pSearch.length < pString.length) {
    					pString = pString.substring(vN+pSearch.length, pString.length);
    				} else {
    					pString = ''
    				};
    				vN = pString.indexOf(pSearch);
    		};
    	};
    	return vReturnString + pString;
    };


    function preprocessMath(str,doc,toFormat) {
      if (toFormat && toFormat == "source") {
        return preprocessMath4Source(str,doc);
      } else {
        return preprocessMath4HTML(str,doc);
      }
    }

    function preprocessMath4Source(str,doc) {
      console.log("sceditor/formats/mediawiki.js:2946 - preprocessMath4Source()");
      return str;
    }

    function preprocessMath4HTML(str,doc) {
      console.log("sceditor/formats/mediawiki.js:2691 - preprocessMath4HTML()");
      var matharr = str.split("$$");
      var tag_array = ["<math>","</math>"];
      var mathtag = "";
      var out = "";
      for (var i = 0; i < matharr.length; i++) {
        out += mathtag + matharr[i];
        mathtag = tag_array[(i+0) % 2]
      }
      if ((matharr.length % 2) == 0) {
        //close math tag
        out += tag_array[1];
      }
      return out;
    }

    function tokenizeMath4Source(str,doc) {
      console.log("sceditor/formats/mediawiki.js:3054 - tokenizeMath4Source(str,doc) str='"+str+"'");
      alert("sceditor/formats/mediawiki.js:3713 - tokenizeMath4Source(str,doc) str='"+str+"'");
      //alert("sceditor/formats/mediawiki.js:3054 - NOTHING-DONE - tokenizeMath4Source(str,doc)")
      return str;
    }

    function tokenizeMath(str,doc,toFormat) {
      console.log("sceditor/formats/mediawiki.js:3065 - tokenizeMath(str,doc,'"+toFormat+"')");
      doc.timeid = get_unique_id("ID");
      if (toFormat && toFormat == "source") {
        // tokenize mathematical expression to mediawiki source code
        return tokenizeMath4Source(str,doc);
      } else {
        // tokenize mathematical expression to HTML code for display and preview
        return tokenizeMath4HTML(str,doc);
      }
    }

    function detokenizeMath(str,doc,toFormat) {
      console.log("sceditor/formats/mediawiki.js:3075 - detokenizeMath(str,doc,'"+toFormat+"')");
      doc.timeid = get_unique_id("DOC");
      if (toFormat && toFormat == "source") {
        return detokenizeMath4Source(str,doc);
      } else {
        return detokenizeMath4HTML(str,doc);
      }
    }

    /*


    function detokenizeMath4Source(text, data, options) {
      //console.log("Export Math to Text not implemented yet!");
      if (data.hasOwnProperty("mathexpr")) {
        for (var i = 0; i < data.mathexpr.length; i++) {
          var detok = data.mathexpr[i];
          if (detok.type=="block") {
            text = replaceString(text,detok.label,"\n:<math display=\"block\" id=\""+get_unique_id("MATH")+"\">\n  "+detok.math+"\n</math>");
          } else if (detok.type=="inline") {
            text = replaceString(text,detok.label,"<math display=\"inline\" id=\""+get_unique_id("MATH")+"\">\n  "+detok.math+"\n</math>");
          }
        }
      }
      return text
    }

    */

    function detokenizeMath4HTML(text, data, options) {
      //console.log("Export Math to Text not implemented yet!");
      if (data.hasOwnProperty("mathexpr")) {
        for (var i = 0; i < data.mathexpr.length; i++) {
          var detok = data.mathexpr[i];
          if (detok.type=="block") {
            //<div id="MAT1689873688672C6" class="mathblock">
            text = replaceString(text,detok.label,"\n<div class=\"mathblock\" id=\"" + get_unique_id("MAT") + "\">\n  "+detok.math+"\n</div>");
            //text = replaceString(text,detok.label,"\n:<math display=\"block\">\n  "+detok.math+"\n</math>");
          } else if (detok.type=="inline") {
            // <span id="MAT1689873688672C4" class="mathinline">
            text = replaceString(text,detok.label,"<span class=\"mathinline\" id=\"" + get_unique_id("MAT") + "\">\n  "+detok.math+"\n</span>");
            //text = replaceString(text,detok.label,"<math display=\"inline\">\n  "+detok.math+"\n</math>");
          }
        }
      }
      return text
    }

    function getAttribute4String(str,id4att,default4att) {
      default4att = default4att || "";
      var value4att;
      var ret = "";
      if (id4att) {
        id4att = id4att.replace(/[^a-zA-Z_0-9]/g,"");
      }
      // check once again if id4att is empty due to removal of all characters
      if (id4att) {
        //<a[^>]*?href=(["\'])?((?:.(?!\1|>))*.?)\1?[^>]*>
        var regxstr = '\\s?' + id4att + '=(["\\\'])?((?:.(?!\\1|>))*.?)\\1?[^$]';
        alert("regxstr="+regxstr);
        var regx = new RegExp(regxstr);
      }
      if (str) {
        //str = str.replace(regx, function (pMatch, pStrDelimiter, pAttValue) {
        //  return pAttValue;
        //});
        attmatch = str.match(regex) ;
        if (attmatch) {
          ret = attmatch;
        }
      } else {
        ret = default4att;
      }
      return ret;
    };

    function tokenizeMath4HTML(wiki, data, pOptions) {
      data.timeid = get_unique_id("TIME_");
      var vLabel = "-";
      var timeid = data.timeid;
      var vCount = 0;
      var display;
      //console.log("sceditor/formats/mediawiki.js:3113 - tokenizeMathBlock() - Time ID="+data.timeid);
      //alert("sceditor/formats/mediawiki.js:3822 - tokenizeMath() wiki='"+wiki+"'")
      wiki = wiki.replace(/(\n[:]+)[\s]*<(math[^>]*?)>([\s\S]+?)<\/math>/g, function (pMatch, prefix, attrs, inside) {
        //console.log("sceditor/formats/mediawiki.js:3821 - tokenizeMathBlock() - prefix="+prefix+" attrs='"+attrs+"' inside='"+inside+"'");
        //alert("sceditor/formats/mediawiki.js:3822 - tokenizeMathBlock() - prefix="+prefix+" attrs='"+attrs+"' inside='"+inside+"'");
        vCount++;
        display = "block";
        if (attrs && attrs.indexOf("inline") >=0 ) {
          //alert("Math Expression Attributes: '"+attrs+"'")
          // getAttribute4String(attribname,default_if_no_value);
          display = getAttribute4String("display",display);
        }
        vLabel = "___MATH_" + (display.toUpperCase()) + "_"+data.timeid+"_ID_"+vCount+"___";
        data.mathexpr.push({
          "type":  display,
          "attrs": attrs,
          "label": vLabel,
          "math":  inside
        });
        return "\n" + vLabel;
      });
      //console.log("sceditor/formats/mediawiki.js:3125 - tokenizeMathInline() - Time ID="+data.timeid);
      //alert("sceditor/formats/mediawiki.js:3841 - tokenizeMath() wiki='"+wiki+"'")
      wiki = wiki.replace(/<(math[^>]*?)>([\s\S]+?)<\/math>/g, function (pMatch, attrs, inside) {
        vCount++;
        display = "inline";
        if (attrs && attrs.indexOf("block") > 0) {
          display = "block";
        }
        //console.log("Math Expression Attributes: '"+attrs+"' display='"+display+"'")
        vLabel = "___MATH_" + (display.toUpperCase()) + "_"+data.timeid+"_ID_"+vCount+"___";
        data.mathexpr.push({
          "type": display,
          "attrs": attrs,
          "label":vLabel,
          "math": inside
        });
        return vLabel;
      });
      return wiki;
    }

    /*
    function tokenizeMathBlock4HTML(wikicode, doc, options) {
      var timeid = doc.timeid;
      console.log("sceditor/formats/mediawiki.js:3018 -  tokenizeMathBlock4HTML() Time ID="+doc.timeid);
      var regx_start = /\n[:]+[\s]*?<math[^>]>/gi;
      var regx_end = /<\/math[^\>]*?>/gi;
      //traverse4Source(str,doc,regx_start,regx_end,callback,id_prefix) {

      traverse4Source(wikicode,doc,regx_start, regx_end, handle_traverse4id, options);
    }
    */

    function tokenizeMathBlock4HTML(wikicode, doc, options) {
      var timeid = doc.timeid;
      console.log("sceditor/formats/mediawiki.js:3018 -  tokenizeMathBlock() Time ID="+doc.timeid);
      if (wikicode) {
        // create the mathexpr array if
        //var vSearch = /(<math[^>]*?>)(.*?)(<\/math>)/gi;
        var vSearch = /\n[:]+[\s]*?<(math[^>]*?)>([.\n]*?)<\/math>/gi;
        //var vSearch = /\n[:]+[\s]*?(<math>)(.*?)(<\/math>)/gi;
        // \n            # newline
        // [:]+          # one or more colons
        // [\s]*?        # (optional) tabs and white space
        // <math[^>]*?>  # opening <math> tag
        // (.*?)         # enclosed math expression
        //(<\/math>)     # closing </math> tag
        //
        // gi            # g global, i ignore caps
        var vResult;
        var vCount =0;
        var vLabel = "";
        var vType = "";
        console.log("sceditor/formats/mediawiki.js:3035 -  wikicode defined");
        while (vResult = vSearch.exec(wikicode)) {
          vCount++;
          vType = "block";
          var vLatex = vResult[2];
          var vInnerTag = vResult[1].toLowerCase();
          console.log("Math Expression "+vCount+": <"+vResult[1]+"> '" + vResult[2] + "' found");
          vLabel = "___MATH_BLOCK_"+doc.timeid+"ID"+vCount+"___";
          //var vFound = replaceMathNewLines(vResult[1]);
          if (vInnerTag.indexOf("inline") > 0) {
            alert()
            vType = "inline";
          }
          doc.mathexpr.push({
            "type": vType,
            "label":vLabel,
            "math": vResult[2]
          });
          wikicode = replaceString(wikicode,vResult[0],vLabel);
          //wikicode = replaceString(wikicode,vFound,vLabel);
        };
      };
      return wikicode
    }

    function tokenizeMathInline4HTML(wikicode, doc, options) {
      console.log("sceditor/formats/mediawiki.js:3055 - parseMathBlock() Time ID="+doc.timeid);
      if (wikicode) {
        //var vSearch = /(<math[^>]*?>)(.*?)(<\/math>)/gi;
        var vSearch = /<math[^>]*?>(.*?)<\/math>/gi;
        //var vSearch = /\n[:]+[\s]*?(<math>)(.*?)(<\/math>)/gi;
        // <math[^>]*?>  # opening <math> tag
        // (.*?)         # enclosed math expression
        //(<\/math>)     # closing </math> tag
        //
        // gi            # g global, i ignore caps
        var vResult;
        var vCount =0;
        var vLabel = "";
        console.log("sceditor/formats/mediawiki.js:3068 - wikicode defined");
        while (vResult = vSearch.exec(wikicode)) {
          vCount++;
          console.log("Math Expression "+vCount+": '" + vResult[1] + "' found");
          vLabel = "___MATH_INLINE_"+doc.timeid+"_ID_"+vCount+"___";
          doc.mathexpr.push({
            "type":"inline",
            "label":vLabel,
            "math": vResult[1]
          });
          wikicode = replaceString(wikicode,vResult[0],vLabel);
        };
      };
      return wikicode
    }

    function tokenizeCitation(wiki, data, toFormat, options) {
      if (options && options.parse && options.parse.citations && options.parse.citations == false) {
        console.log("tokenize citations was not performed - options.parse.citations=false");
        //wiki = tokenizeRefs(wiki, data, options);
      } else {
        console.log("tokenize citations performed");
        if (toFormat && toFormat == "source") {
          wiki = tokenizeCitation4Source(wiki,data);
        } else {
          wiki = tokenizeCitation4HTML(wiki,data);
        }
        //wiki = tokenizeRefs(wiki, data, options);
      }
      return wiki
    }

    function detokenizeCitation(wiki, data, toFormat, options) {
      options = options || {};
      if (options.parse && options.parse.citations && options.parse.citations == false) {
        console.log("tokenize citations was not performed - options.parse.citations=false");
        //wiki = tokenizeRefs(wiki, data, options);
      } else {
        console.log("tokenize citations performed");
        if (toFormat && toFormat == "source") {
          wiki = detokenizeCitation4Source(wiki,data,options);
        } else {
          wiki = detokenizeCitation4HTML(wiki,data,options);
        }
        //wiki = tokenizeRefs(wiki, data, options);
      }
      return wiki
    }

    function detokenizeCitation4Source(wiki, data, options) {
      console.log("CALL: detokenizeCitation4Source()");
      return wiki;
    }

    function detokenizeCitation4HTML(wiki, data, options) {
      console.log("CALL: detokenizeCitation4HTML()");
      return wiki;
    }


    function name2label(pname) {
      //replace blank and non characters or digits by underscore "_"
      var vLabel = str.replace(/[^A-Za-z0-9]/g,"_");
      vLabel = vLabel.replace(/[_]+/g,"_");
      vLabel = vLabel.replace(/^_/g,"");
      vLabel = vLabel.replace(/_$/g,"");
      if (vLabel == "") {
        vLabel = null;
      };
      return vLabel
    }

    function getCiteLabel(data,pid) {
      //replace blank and non characters or digits by underscore "_"
      return "___CITE_"+data.timeid+"_ID_"+pid+"___";
    }

    function storeReference(wiki,data,references,tmpl,pLabel,type4ref) {
      //if (hasCitation(tmpl)) {
      if (type4ref !== "inline") {
        let obj = parseCitation(tmpl);
        if (obj) {
          obj.label = pLabel;
          obj.type = type4ref
          references.push(obj);
        };
        // Remove Citation from Wiki Source ???
        //wiki = wiki.replace(tmpl, '');
      } else {
        let obj = parseInline(tmpl);
        obj.label = pLabel;
        references.push(obj);
      };
      return wiki;
    }

    function tokenizeCitation4Source(wiki, data, options) {
      console.log("CALL: tokenizeCitation4HTML()");
      return wiki;
    }

    function tokenizeCitation4HTML(wiki, data, options) {
      console.log("CALL: tokenizeCitation4HTML()");
      let references = [];
      // (1) References without a citaion label
      wiki = wiki.replace(/ ?<ref>([\s\S]{0,1000}?)<\/ref> ?/gi, function(a, tmpl){
        // getCiteLabel(data,pid) returns  ___CITE_8234987294_5___
        console.log("Citation Expression "+references.length+": '" + tmpl + "' found");
        let vLabel = getCiteLabel(data,references.length);
        wiki = storeReference(wiki,data,references,tmpl,vLabel,"inline");
        return vLabel;
      });
      wiki = wiki.replace(/{{(cite|citation|Literatur)([\s\S]{0,1000}?)}}/gi,function (exp,type4ref, ref) {
        console.log("Citation Expression "+references.length+": '" + ref + "' with type '"+type4ref+"' found");
        let vLabel = getCiteLabel(data,references.length);
        wiki = storeReference(wiki,data,references,ref,vLabel,type4ref);
        return vLabel;
      })
      // (2) Cite a reference by a label WITHOUT reference
      // replace <ref name="my book label"/> by "___CITE_7238234792_my_book_label___"
      wiki = wiki.replace(/ ?<ref[\s]+name=["']([^"'])["'][^>]{0,200}?\/> ?/gi,function(a, tmpl) {
        console.log("Citation Expression "+references.length+": '" + a + "' with label='"+tmpl+"' found");
        let vLabel = getCiteLabel(data,name2label(tmpl));
        return vLabel;
      });
      // (3) Reference with citation label that is used multiple time in a document by (2)
      wiki = wiki.replace(/ ?<ref [\s]+name=["']([^"'])["'][^>]{0,200}?>([\s\S]{0,1000}?)<\/ref> ?/gi, function(a, name, tmpl) {
        /* difference between name, label and cite label
           (3a) name='my book name#2012'
           (3b) label='my_book_name_2012'
           (3c) cite_label='___CITE_7238234792_my_book_label_2012___' is the unique marker in the text
         the citation label is a marker in the text with a unique time stamp and defined syntax
         which is very unlikely to have a text element in an article.
        */
        // Convert e.g. name='my book name#2012' to 'my_book_name_2012'
        console.log("sceditor/formats/mediawiki.js:3353 - Citation Expression "+references.length+": '" + tmpl + "' with label='"+name+"' found");
        var vLabel = name2label(name);
        if (vLabel) {
          console.log("sceditor/formats/mediawiki.js:3356 - tokenizeCitation4HTML() created cite label='"+vLabel+"' from name='"+name+"'");
          vLabel = getCiteLabel(data,vLabel);
        } else {
          // convert a standard label with the reference length of the array as unique ID generator
          vLabel = getCiteLabel(data,references.length);
        };
        wiki = storeReference(wiki,data,references,tmpl,vLabel,"inline");
        return vLabel;
      });
      data.refs4token = references;
      //data.references = references.map(r => new Reference(r));
      return wiki;
    }

    function parseRefs(wiki, data, options) {
      let references = [];
      wiki = wiki.replace(/ ?<ref>([\s\S]{0,1000}?)<\/ref> ?/gi, function(a, tmpl) {
        if (hasCitation(tmpl)) {
          let obj = parseCitation(tmpl);
          if (obj) {
            references.push(obj);
          }
          wiki = wiki.replace(tmpl, '');
        } else {
          references.push(parseInline(tmpl));
        }
        return ' ';
      });
      // <ref name=""/>
      wiki = wiki.replace(/ ?<ref[\s]+name=["']([^"'])["'][^>]{0,200}?\/> ?/gi, ' ');
      // <ref name=""></ref>
      wiki = wiki.replace(/ ?<ref [^>]{0,200}?>([\s\S]{0,1000}?)<\/ref> ?/gi, function(a, tmpl) {
        if (hasCitation(tmpl)) {
          let obj = parseCitation(tmpl);
          if (obj) {
            references.push(obj);
          }
          wiki = wiki.replace(tmpl, '');
        } else {
          references.push(parseInline(tmpl));
        }
        return ' ';
      });
      //now that we're done with xml, do a generic + dangerous xml-tag removal
      wiki = wiki.replace(/ ?<[ \/]?[a-z0-9]{1,8}[a-z0-9=" ]{2,20}[ \/]?> ?/g, ' '); //<samp name="asd">
      data.references = references.map(r => new Reference(r));
      return wiki;
    };

    function found4search(pMatch,maxlength) {
      maxlength = maxlength || 200;
      var ret = false;
      if (pMatch) {
        //alert("pMatch");
        if (pMatch.openbracket_at && pMatch.openbracket_at >=0) {
          //alert("pMatch.openbracket_at");
          if (pMatch.closebracket_at && pMatch.closebracket_at > pMatch.openbracket_at) {
            if (pMatch.closebracket_at - pMatch.openbracket_at < maxlength) {
              //alert("pMatch.closebracket_at");
              ret = true;
            }
          }
        }
      }
      //alert("found4search()="+ret+" pMatch="+JSON.stringify(pMatch))
      return ret;
    }
    /*
    doc = {
      "src":"wiki text source",
      "mediapath":"https://en.wikiversity.org/wiki/Special:Redirect/file/",
      "domain": (pDomain || "wikiversity"),
      "language": (pLanguage || "en"),
      "timeid":"-",
      "links": {
          "int":[],
          "ext":[]
      },
      "mathexpr": [],
      "images": [],
      "citations": [],
      "media": {
        "audio": [],
        "video": [],
        "image": []
      }
    }
    */

    function getWikiMediaURL(pFileName,doc) {
  		//console.log("getWikiMediaURL('"+pFileName+"')");
      var ret = pFileName;
      var mediapath = (doc && doc.mediapath) || "https:/" + "/en.wikiversity.org/wiki/Special:Redirect/file/";
      var fp = names4wiki.file // fileprefix
      if (pFileName) {
        var found;
        pFileName = pFileName.replace(/\s/g,"_");
        for (var i = 0; i < fp.length; i++) {
          found = pFileName.indexOf(fp[i]+":");
          if (found == 0) {
            pFileName = pFileName.substring(found+fp[i].length+1);
          }
        }
    		ret = doc.mediapath + pFileName;
      }
    	return ret;
  	};

    function push2media(id4media,rec) {
      var vLabel;
      if (id4media) {
        if (doc && doc.media && doc.media[id4media] && (Array.isArray(doc.media[id4media]))) {
            vLabel = get_unique_id(id4media.toUpperCase());
            rec["id"] = vLabel;
            doc.media[id4media].push(rec);
        }
      } else {
        console.error("id4media='"+id4media+"' and doc.media."+id4media+" is undefined.");
      }

    }

    function check_audiotype(doc) {
        var vReturn = "html";
        if (doc) {
          if (doc.audiotype) {
    				vReturn = doc.audiotype;
          }
        }
        console.log("Audio Type: '"+vReturn+"'");
  		  return vReturn;
  	}

    function handleAudio4HTML(pLinkSplit,pFileType,pURL,doc) {
      var AudioTag = "";
      console.log("sceditor/formats/mediawiki.js:3666 - matchstr='"+matchstr+"' is a audio link with filetype='"+pFileType+"'");
      // pLinkSplit = matchstr.split("|");
      if (pLinkSplit.length > 0) {
        var vText = "Audio HTML";
        var vURL = getWikiMediaURL(pLinkSplit[0],doc);
        var vAudioID = get_unique_id("AUDIO");
        var vAudioPlayPause = "";
        var vAudioTag = "";
        vAudioPlayPause += '<table class="audioplayer"><tr><td> ';
				vAudioPlayPause += '<input class="buttonaudioplayer" type="button" onclick="play_audio(\'' + vAudioID + '\');" value="&#9658" />';
				vAudioPlayPause += '</td><td>';
				vAudioPlayPause += '<input class="buttonaudioplayer" type="button" onclick="pause_audio(\'' + vAudioID + '\');" value="&#10074;&#10074;" />';
				vAudioPlayPause += '</td></tr></table> ';
				if (isFirefox == true) {
					// Firefox Browser
					vAudioTag =  ' <audio id="' + vAudioID + '"><source src="' + vURL + '" type="audio/' + vAudioType+ '" /></audio> &nbsp;';
					if (check_audiotype(doc) == "dzslides") {
						// DZSlides with Audio
						//replace_str = vAudioTag;
						vAudioTag += "<center>" + vAudioTag + "</center>";
					} else {
						// RevealJS with Audio
						//vAudioTag = '<p class="fragment" data-audio-src="' + vURL + '"></p>';
						vAudioTag = ' <audio id="' + vAudioID + '"><source src="' + vURL + '" type="audio/' + vAudioType+ '" /></audio> &nbsp;';
					}
				} else {
					// Chrome or Safari
					vAudioTag = '<audio id="' + vAudioID + '" controls ><source src="' + vURL + '" type="audio/' + vAudioType+ '" /></audio> ';
					if (this.check_chrome() == true) {
						// Audio OK
						//alert("Browser is Chrome");
						vAudioTag = "<center>" + vAudioTag + "</center>";
					} else {
						//alert("Browser is Safari, ");
						//vAudioTag = "<center><a href='#' onclick=\"alert('Use Firefox or Chrome to listen to Audio Comments.'); return false;\">&#9658</a></center>";
						vAudioTag = "<center>" + vAudioTag + "</center>";
					}
					vAudioPlayPause = " ";
				}
        var rec = {
          "url": vURL, // expanded wikicommons url
          "link": replaceString(pURL," ","_"), // local link
          "text": vText,
          "id": vAudioID,
          "type": pFileType.toUpperCase(),
          "ext": getFileExtension(pLinkSplit[0]),
          "html": vAudioTag
        };

      }
      return vAudioID;
    }

    function handleImage4HTML(pLinkSplit,pFileType,pURL,doc) {
      console.log("sceditor/formats/mediawiki.js:3671 - matchstr='"+matchstr+"' is a image link  with filetype='"+pFileType+"'");
      // pLinkSplit = matchstr.split("|");

    }

    function handleVideo4HTML(pLinkSplit,pFileType,pURL,doc) {
      console.log("sceditor/formats/mediawiki.js:3671 - matchstr='"+matchstr+"' is a video link  with filetype='"+pFileType+"'");
      // pLinkSplit = matchstr.split("|");

    }

    function getMediaFileType(pFileName) {
  		var vType = "none";
  		if ( /\.(jpe?g|png|gif|bmp)$/i.test(pFileName) ) {
  			vType = "img";
  		};
  		if ( /\.(svg)$/i.test(pFileName) ) {
  			vType = "svg";
  		};
  		if ( /\.(mp4|webm|mov|avi|mpe?g|ogv)$/i.test(pFileName) ) {
  			vType = "video";
  		};
  		if ( /\.(mp3|wav|ogg|mid)$/i.test(pFileName) ) {
  			vType = "audio";
  		};
  		return vType
  	}

    function preprocessMedia4Source(matchstr,doc) {
      console.log("sceditor/formats/mediawiki.js:3666 - matchstr='"+matchstr+"' is a media link - check mediatype");
    }

    function getFileExtension(pFilename) {
      var ext = "";
      if (pFilename) {
        var vDotSplit = pFilename.split(".");
        if (vDotSplit.length > 1) {
          ext = vDotSplit[vDotSplit.length-1];
        } else {
          console.warn("no extension found in filename '"+pFilename+"'");
        }
      }
      return ext;
    }

    function preprocessMedia4HTML(matchstr,doc) {
      console.log("sceditor/formats/mediawiki.js:3669 - matchstr='"+matchstr+"' is a media link - check mediatype");
      var out = "";
      if (matchstr) {
        var vLinkSplit = matchstr.split("|");
        var vURL = getWikiMediaURL(matchstr,doc);
        var vFileType = getMediaFileType(vURL);
        switch (vFileType) {
          case "audio":
            out = handleAudio4HTML(vLinkSplit,vFileType,vURL,doc);
          break;
          case "video":
            out = handleVideo4HTML(vLinkSplit,vFileType,vURL,doc);
          break;
          case "img":
            out = handleImage4HTML(vLinkSplit,vFileType,vURL,doc);
          break;
          case "svg":
            out = handleImage4HTML(vLinkSplit,vFileType,vURL,doc);
          break;
          default:
            console.warn("matchstr='"+matchstr+"' is an unknown filetype ");
        }
      } else {
        console.error("preprocessMedia4HTML(matchstr,doc) 'matchstr' does not exist");
      }
      return out;
    }

    function handleLinkMedia4HTML(matchstr,prefix,doc) {
      // prefix="File" or prefix="Kurs" without appended ":"
      var found = names4wiki.files.indexOf(prefix);
      var ret = matchstr;
      if (found >= 0) {
        //alert("sceditor/formats/mediawiki.js:4167 Type of MediaLink: '"+names4wiki.files[found]+"' in matchtstr='"+matchstr+"'");
        // means that sqbracket2-entitiy is Media
        console.log("sceditor/formats/mediawiki.js:4169 - matchstr='"+matchstr+"' is a media link [["+prefix+":...]]");
        ret = preprocessMedia4HTML(matchstr,doc);
      } else {
        console.log("sceditor/formats/mediawiki.js:4172 - matchstr='"+matchstr+"' is an internal link");
        //alert("sceditor/formats/mediawiki.js:4173 - Type of '"+matchstr+"' is an internal link");
        ret = preprocessIntLinks4HTML(matchstr,doc);
      }
      return ret;
    }

    function preprocessIntLinkMedia4HTML(str,doc) {
      console.log("sceditor/formats/mediawiki.js:3672 - preprocessIntLinkMedia4HTML(str,doc)");
      var vSearch = /\[\[([a-zA-Z]+)[^\]]*/g;
      var vResult,vMatch;
      while (vResult = vSearch.exec(str) ) {
        console.log("sceditor/formats/mediawiki.js:3676 - preprocessIntLinkMedia4HTML(str,doc) vResult="+JSON.stringify(vResult,null,4));
        // search for begin of vSearch regex
        var start_at = str.indexOf(vResult[0]);
        // if IntLinkMedia "sqbracket2" found
        // search for corresponding closing "]"
        if (start_at >= 0) {
          var vMatch = find_closing_bracket(str,"]",start_at);
          // found4search checks if closing bracket was found
          // the closing bracket is not "too far away" from opening bracket
          if (found4search(vMatch) == true) {
            var matchstr = str.substring(vMatch.openbracket_at+2,vMatch.closebracket_at-1);
            //var vLabel = get_unique_id("LINKMEDIA");
            // vResult[1] is the found prefix e.g. "file"
            var prefix = vResult[1].toLowerCase();
            var vLabel = handleLinkMedia4HTML(matchstr,prefix,doc);
            str = replaceString(str, "[[" + matchstr + "]]",vLabel);
          };
        }
      }
    	return str;
    }

    //#################################################################
  	//# PUBLIC Method: getWikiDisplayURL()
  	//#    used in Class: WikiConvert
  	//# Parameter:
  	//#    pWikiCode:String
  	//# Comment:
  	//#    expand a local link to the full Wiki Display URL
  	//# Return: String
  	//# created with JSCC  2017/03/05 18:13:28
  	//# last modifications 2018/01/21 17:17:18
  	//#################################################################

  	 function getWikiDisplayURL(pLink,doc) {
      var vURL = pLink || "undefined-link";
      if (doc) {
        var vLanguage = doc.language || "en";
        var vDomain = doc.domain || "wikiversity";
        var vServer  = vLanguage+"."+vDomain+".org";
        console.log("sceditor/formats/mediawiki.js:3774 - getWikiDisplayURL('"+pLink+"') vServer='"+vServer+"'");
        //alert("sceditor/formats/mediawiki.js:3993 - getWikiDisplayURL('"+pLink+"') vServer='"+vServer+"'");
        var vMap = names4wiki.map2domain;
        var vLinkArr = [];
        if (pLink) {
          pLink = replaceString(pLink," ","_");
          vLinkArr = pLink.split(":");
        } else {
           pLink = "";
        }
        // pLink = "Wikipedia:Water"
        var vArticle = pLink;
        // vArticle = "Water"
        if (vLinkArr.length == 2) {
          // Wikipedia:Swarm_intelligence
          // w:Swarm_intelligence
          // /Slime_mold/
          // Category:Risk Management
          if ((vLinkArr[0]).toLowerCase() == "category") {
            // Category:Risk Management
            vArticle = pLink || "undefined_wiki_link";
          } else {
            // w:Swarm_intelligence
            vServer = vLanguage + "." + vMap[vLinkArr[0]]+".org";
            vArticle = vLinkArr[1] || "undefined_wiki_link";
          };

        } else if (vLinkArr.length == 3) {
          // w:en:Swarm_intelligence
          // [[Wikipedia:Category:Risk Management]]
          var vLinkLanguage = vLanguage;
          var vLinkDomain = vDomain;
          if ((vLinkArr[1]).toLowerCase() == "category") {
            // [[Wikipedia:Category:Risk Management]]
            vArticle = vLinkArr[1]+":"+vLinkArr[2] || "undefined_category";
            // vArticle = "Category:Risk Management"
          } else {
            vArticle = vLinkArr[2] || "undefined_wiki_link";
            // w:en:Swarm_intelligence
            vLinkLanguage = vLinkArr[1];     // vLinkArr[1] = "en"
            vLinkDomain = vMap[vLinkArr[0]]; // map "w" to "wikipedia"
          };
          vServer = vLinkLanguage + "." + vLinkDomain +".org";
        } else if (vArticle.indexOf("/")==0) {
          // Link: "/Slime mold/"
          vArticle = (doc.wikititle || "undefined-parent-wiki")+vArticle;
          // Link: "Swarm intelligence/Slime mold/ "
          // remove last "/" and blanks at end
          vArticle = vArticle.replace(/[\/\s]+$/i,"");
          // Link: "Swarm intelligence/Slime mold"
        };
        vArticle = replaceString(vArticle," ","_");
        // Link: "Swarm_intelligence/Slime_mold"
        vURL = "https:/" + "/"+vServer+"/wiki/"+vArticle;
        // URL: "https://en.wikiversity.org/wiki/Swarm_intelligence/Slime_mold"

      } else {
        console.error("getWikiDisplayURL('"+pLink+"',doc) parameter 'doc' is undefined");
      };
      return vURL;
  	};


    function preprocessIntLinks4Source(matchstr,doc) {
      console.log("sceditor/formats/mediawiki.js:3009 - preprocessIntLinks4Source(matchstr,doc) matchstr='"+matchstr+"'");
      var str = matchstr;

      return str;
    }

    function get_internal_link(link,doc) {
      var vIntLink = {
        "url": "",
        "link": link,
        "id": get_unique_id("INTLINK"),
        "prefix": "",
        "text": "",
        "language":"",
        "domain": "",
        "path":"",
        "type": "INTLINK"
      };
      if (doc) {
        // external url to Wikiversity or Wikipedia
        vIntLink.url = getWikiDisplayURL(link,doc);
        vIntLink.path = getWikiDisplayURL("",doc);
      } else {
        console.error("getWikiDisplayURL('"+link+"',doc) could not be calculated, because 'doc' is a missing parameter");
      }
      var name_index = 0;
      if (link) {
        var vLinkSplit = link.split(":");
        if (vLinkSplit.length > 1) {
          // check domain e.g. "w" for Wikipedia or "b" for wikibooks
          var vID = vLinkSplit[0];
          var found = names4wiki.domain.indexOf(vID);
          if (found >= 0) {
              vIntLink.domain = names4wiki.domain[found];
              vIntLink.prefix += vIntLink.domain;
              name_index = 1;
          };
          // check language as first parameter of link
          // [[de:Wasser]] interlanguage link
          //e.g. "en" for English or "de" for german
          found = names4wiki.language.indexOf(vID);
          if (found >= 0) {
              vIntLink.language = names4wiki.language[found];
              vIntLink.prefix += vIntLink.language
              name_index = 1;
          }
          // check language as second parameter of link
          // [[w:de:Wasser]] interwiki link to Wikipedia
          if (vLinkSplit.length > 2) {
            vID  = vLinkSplit[1];
            found = names4wiki.language.indexOf(vID);
            if (found >= 0) {
                vIntLink.language = names4wiki.language[found];
                if (!vIntLink.link) {
                  vIntLink.link += ":";
                };
                vIntLink.link += vIntLink.language;
                name_index = 2;
            }
          }
        }
      }
      // append non-empty vIntLink.link a colon
      // append "w:de" with colon to "w:de:"
      if (!vIntLink.link) {
        vIntLink.link += ":";
      };
      // create the link name i.e. from "w:de:Wasser"
      // the name will be "Wasser"
      var vSep = "";
      for (var i = name_index; i < vLinkSplit.length; i++) {
        vIntLink.text += vSep + vLinkSplit[i];
        vSep = ":";
      }
      return vIntLink;
    }

    function preprocessIntLinks4HTML(matchstr,doc) {
      var str = matchstr;
      var intlink = get_internal_link(matchstr,doc) ;
      //alert("append internal Link "+JSON.stringify(intlink,null,4));
      doc.links.int.push(intlink);
      console.log("sceditor/formats/mediawiki.js:3009 - preprocessIntLinks4HTML(matchstr,doc) matchstr='"+matchstr+"'");
      str = "<url href=\"" + intlink.url +"\" id=\"" + intlink.id +"\" type4link=\"" + intlink.type + "\" link=\"" + intlink.link + "\"  path=\"" + intlink.path + "\">"+intlink.text+"</url>";
      //alert(str);
      //return intlink.id;
      return str;
    }

    function preprocessExtLinks4HTML(str,doc) {
      console.log("sceditor/formats/mediawiki.js:3009 - preprocessLinks4HTML()");
      var vSearch = /\[(http[^\[\]]+)\]/g;
			// \[\[         # "[["
			//(             # group 1
			//  [^\[\]]+    #   any character except "[" and "]" ":" at least once
			// )            # end group 1 - this will be the image's name
			// \]\]         # "]]"
			var vResult;
      var vCount =0;
			var vLink = "";
			var vLinkSplit;
			var vType = "";
			var vFoundBlank = 0;
      var vLinkRec;
			while (vResult = vSearch.exec(str)) {
				vCount++;
        var vID = get_unique_id("EXTLINK");
				vFoundBlank = vResult[1].indexOf(" ");
				if (vFoundBlank > 0) {
          vLinkRec = {
            "url": vResult[1].substr(0,vFoundBlank),
            "text": vResult[1].substr(vFoundBlank+1),
            "id": vID,
            "type": "EXTLINK"
          };
				} else {
          vLinkRec = {
            "url": vResult[1],
            "text": vResult[1],
            "id": vID,
            "type": "EXTLINK"
          };
				};
        doc.links.ext.push(vLinkRec);
				vLink = "<url href=\"" + vLinkRec.url +"\" target=\"_blank\" id=\""+vLinkRec.id+"\" type4link=\""+vLinkRec.type+"\">" + vLinkRec.text + "</url>";
				//str = replaceString(str,"["+vResult[1]+"]",vID);
        str = replaceString(str,"["+vResult[1]+"]",vLink);
			};
			return str;
    }

    function clearLinks4Doc(doc) {
      if (doc && doc.links) {
        doc.links.ext = [];
        doc.links.int = [];
      }
    }


    function preprocessLinkMedia4Source(str,doc) {
      console.log("sceditor/formats/mediawiki.js:4281 - preprocessLinkMedia4Source()");
      return str;
    }

    function preprocessLinks4Source(str,doc) {
      console.log("sceditor/formats/mediawiki.js:4281 - preprocessLinks4Source()");
      return str;
    }


    function preprocessLinks(str,doc,toFormat,keeplinks) {
      if (keeplinks && (keeplinks == true)) {
        console.log("Link data kept in 'doc.links'");
      } else {
        clearLinks4Doc(doc);
      }
      if (toFormat && toFormat == "source") {
        str  = preprocessExtLinks4Source(str,doc);
        return preprocessIntLinkMedia4Source(str,doc);
      } else {
        str  = preprocessExtLinks4HTML(str,doc);
        return preprocessIntLinkMedia4HTML(str,doc);
      }
    }



    function preprocessTable(str,doc,toFormat) {
      console.log("sceditor/formats/mediawiki.js:2760 - preprocessTable()");
      if (toFormat && toFormat == "source") {
        return preprocessTable4Source(str,doc);
      } else {
        return preprocessTable4HTML(str,doc);
      }
    }

    function preprocessTable4Source(str,doc) {
      console.log("sceditor/formats/mediawiki.js:2976 - preprocessTable4Source()");
      return str;
    }

    function preprocessTable4HTML(str,doc) {
      var out = "";
      console.log("sceditor/formats/mediawiki.js:2987 - preprocessTable4HTML()");
      /* CONVERT wikitable first elements for better parsing
      {| class="wikitable" style="margin:auto"
      |+ Caption text
      |-
      ! Header text !! Header text !! Header text
      |-
      | ExampleR1C1 || ExampleR1C2 || ExampleR1C3
      |-
      | ExampleR2C1 || ExampleR2C2 || ExampleR2C3
      |}

      CONVERTED TO
      |+ Caption text
      |-!! Header text !! Header text !! Header text
      |-|| ExampleR1C1 || ExampleR1C2 || ExampleR1C3
      |-|| ExampleR2C1 || ExampleR2C2 || ExampleR2C3
      |}

      <table>
        <caption>Caption text</caption>
        <tbody>
          <tr>
            <th>Header text 1&nbsp;<br></th><th> Header text 2&nbsp;<br></th><th> Header text 3<br><br></th>
          </tr>
          <tr> <th>Header text 1&nbsp;<br></th><th> Header text 2&nbsp;<br></th><th> Header text 3<br><br></th> </tr><tr> <th>Header text 1&nbsp;<br></th><th> Header text 2&nbsp;<br></th><th> Header text 3<br><br></th> </tr><tr> <th>Header text 1&nbsp;<br></th><th> Header text 2&nbsp;<br></th><th> Header text 3<br><br></th> </tr><tr> <th>Header text 1&nbsp;<br></th><th> Header text 2&nbsp;<br></th><th> Header text 3<br><br></th> </tr></tbody></table>
      */
      if (str) {
        console.log("sceditor/formats/mediawiki.js:4647 - BEFORE Table Convert\nstr='"+str+"'");
        out = "\n"+str;
        var ta = out.split("\n{|");
        if (ta.length > 1) {
          // at least one table exists
          out = ta[0];
          // remove leading "\n", which was inserted before
          out = out.substring(1);
          // iterate over odd table
          i=1;
          while (i < ta.length) {
            var tmparr = (ta[i]).split("\n|}");
            // split table into lines
            var tablebody = tmparr[0]
            var tablelines = tablebody.split("\n");
            // insert <table> tag with attributes
            // tablelines[0] are the header attributes
            out += "\n<table "+ tablelines[0] + ">";
            // check for <caption> with "\n|+"
            var vPos = tablebody.indexOf("\n|+");
            if (vPos>= 0) {
              // caption exists, remove "\n|+" to extract caption
              tablebody = tablebody.substring(vPos+3);
              // find caption line end
              vPos = tablebody.indexOf("\n");
              if (vPos > 0) {
                // does not include "\n"
                var caption = tablebody.substring(0,vPos);
                caption = caption.trim();
                out += "\n<caption>"+caption+"</caption>";
                // remove caption from tablebody
                tablebody = tablebody.substring(vPos);
              } else {
                // table with just a caption - handle even those tables
                out += "\n<caption>"+tablebody+"</caption>";
                tablebody = "";
              }
            }
            // split table rows
            if (tablebody) {
              tablelines = tablebody.split("|-");
              for (var k = 0; k < tablelines.length; k++) {
                var row = (tablelines[k]).replace(/^[\n\s\t]+/,"");
                vPos = row.indexOf("!!");
                if (vPos >= 0) {
                  // this is a header
                  row = row.replace(/^[!\s]+/,"");
                  var cols = row.split("!!");
                  out += "\n<tr> <th>"+cols.join("</th><th>")+ "</th> </tr>";
                } else {
                  vPos = row.indexOf("||");
                  if (vPos >= 0) {
                    // this is a standard table row
                    row = row.replace(/^[\|\s]+/,"");
                    var cols = row.split("||");
                    out += "\n<tr><td>"+cols.join("</td><td>")+ "</td></tr>";
                  }
                }
              }
            }
            // check if table contains a caption
            out += "\n</table>\n";
            // append postfix of table if exists
            if (tmparr.length > 1) {
                str += "\n" + tmparr[1];
            }
            i++
          }
        }
        //str = str.replace(/\|-[\n\s]+\|\-!/g,"|-!!");
        //str = str.replace(/\|-[\n\s]+\|\-\|/g,"|-||");
        //alert("sceditor/formats/mediawiki.js:3057 - AFTER Table Convert\nstr='"+out+"'");
        console.log("sceditor/formats/mediawiki.js:3057 - AFTER Table Convert\nstr='"+out+"'");
      }

      return out;
    }

    function postprocessTable(str,doc,toFormat) {
      console.log("sceditor/formats/mediawiki.js:3013 - postProcessTable()");
      if (toFormat && toFormat == "source") {
        return postprocessTable4Source(str,doc);
      } else {
        return postprocessTable4HTML(str,doc);
      }
    }

    function postprocessTable4Source(str,doc) {
      console.log("sceditor/formats/mediawiki.js:3022 - postprocessTable()");
      //return "undefined code in postprocessTable4Source(str)"
      return str;
    }

    function postprocessTable4HTML(str,doc) {
      console.log("sceditor/formats/mediawiki.js:3026 - postprocessTable()");
      /* CONVERT wikitable first elements for better parsing
      {| class="wikitable" style="margin:auto"
      |+ Caption text
      |-
      ! Header text !! Header text !! Header text
      |-
      | ExampleR1C1 || ExampleR1C2 || ExampleR1C3
      |-
      | ExampleR2C1 || ExampleR2C2 || ExampleR2C3
      |}

      CONVERTED TO
      |+ Caption text
      |-!! Header text !! Header text !! Header text
      |-|| ExampleR1C1 || ExampleR1C2 || ExampleR1C3
      |-|| ExampleR2C1 || ExampleR2C2 || ExampleR2C3
      |}
      */

      return str;
    }

    function preprocess(str,doc,toFormat) {
      /*
      var doc = {
        "timeid":"-",
        "links": {
          "int":[],
          "ext":[]
        },
        "mathexpr": [],
        "images": [],
        "citations": [],
        "media": {
          "audio": [],
          "video": [],
          "image": []
        }
      }
      */
      toFormat = toFormat || "html"; // "source"
      console.log("sceditor/formats/mediawiki.js:2691 - preprocess()");
      str = str || "";
      if (str) {
        str = preprocessLinks(str,doc,toFormat);
        str = preprocessMath(str,doc,toFormat);
        //alert("BEFORE tokenizeMath() str='"+str+"'");
        str = tokenizeMath(str,doc,toFormat);
        str = tokenizeCitation(str,doc,toFormat);
        //alert("AFTER tokenizeMath() str='"+str+"'");
        str = preprocessTable(str,toFormat);
        // detokenizeMath is called in toHTML()
        //    str = detokenizeMath(str,doc,toFormat);

      }
      return str;
    }


    function postprocess(str,doc,toFormat) {
      /*
      var doc = {
        "timeid":"-",
        "links": {
          "int":[],
          "ext":[]
        },
        "mathexpr": [],
        "images": [],
        "citations": [],
        "media": {
          "audio": [],
          "video": [],
          "image": []
        }
      }
      */
      toFormat = toFormat || "html"; // "source"
      console.log("sceditor/formats/mediawiki.js:4823 - postprocess()");
      str = str || "";
      if (str) {
        str = postprocessLinks(str,doc,toFormat);
        str = postprocessMath(str,doc,toFormat);
        //alert("BEFORE tokenizeMath() str='"+str+"'");
        str = detokenizeMath(str,doc,toFormat);
        str = detokenizeCitation(str,doc,toFormat);
        //alert("AFTER tokenizeMath() str='"+str+"'");
        str = postprocessTable(str,toFormat);
        // detokenizeMath is called in toHTML()
        //    str = detokenizeMath(str,doc,toFormat);

      }
      return str;
    }

    /**
     * Converts a MediaWiki string to Tree
     *
     * @param {string} str
     * @param {boolean}   preserveNewLines If to preserve all new lines, not
     *                                  strip any based on the passed
     *                                  formatting options
     * @return {string}
     * @memberOf MediaWikiParser.prototype
     */
    base.toTREE = function (str, preserveNewLines, doc) {
      console.log("sceditor/formats/mediawiki.js:2905 - CALL: toTREE('mediawiki') from mediawiki source");
      doc = extend_default_doc(doc);
      /* doc = {
        "timeid":"-",
        "links": {
            "int":[],
            "ext":[]
        },
        "mathexpr": [],
        "images": [],
        "citations": [],
        "media": {
          "audio": [],
          "video": [],
          "image": []
        }
      }
      */
      str = preprocess(str,doc,"html");
      var tokentree = base.parse(str, preserveNewLines);
      return tokentree;
    }

    base.fromTREE = function (tokentree, doc) {
      console.log("sceditor/formats/mediawiki.js:2905 - CALL: fromTREE('mediawiki') to mediawiki source");
      doc = extend_default_doc(doc);
      /* doc = {
        "timeid":"-",
        "links": {
            "int":[],
            "ext":[]
        },
        "mathexpr": [],
        "images": [],
        "citations": [],
        "media": {
          "audio": [],
          "video": [],
          "image": []
        }
      }
      */
      tokentree = sanitize_tokentree(tokentree,'html');
      console.log("sceditor/formats/mediawiki.js:4485 - before calling convertToHTML(tokentree,true) with tokentree="+JSON.stringify(tokentree,null,4));
      var out = convertToHTML(tokentree, true);
      console.log("sceditor/formats/mediawiki.js:4487 - after calling convertToHTML(tokentree,true) with out='"+out+"'");
      //----------------------------------------
      //---- DETOKENIZE for HTML ---------------
      //out = detokenizeCitation(out,doc,"html");
      out = detokenizeMath(out,doc,"html");
      console.log("sceditor/formats/mediawiki.js:4492 - after detokenizeMath/Citation(out,doc) with out='"+out+"'");
      //----------------------------------------
      return out;
    }

    /**
		 * Converts a MediaWiki string to HTML
		 *
		 * @param {string} str
		 * @param {boolean}   preserveNewLines If to preserve all new lines, not
		 *                                  strip any based on the passed
		 *                                  formatting options
		 * @return {string}
		 * @memberOf MediaWikiParser.prototype
		 */
		base.toHTML = function (str, preserveNewLines, doc) {
      console.log("sceditor/formats/mediawiki.js:2905 - CALL: toHTML('mediawiki')");
      /* doc = {
        "timeid":"-",
        "links": {
            "int":[],
            "ext":[]
        },
        "mathexpr": [],
        "images": [],
        "citations": [],
        "media": {
          "audio": [],
          "video": [],
          "image": []
        }
      }
      */
      doc = extend_default_doc(doc);
      //str = preprocess(str,doc,"html");
      //var tokentree = base.parse(str, preserveNewLines);
      var tokentree = base.toTREE(str, preserveNewLines, doc);
      tokentree = sanitize_tokentree(tokentree,'html');
      console.log("sceditor/formats/mediawiki.js:4485 - before calling convertToHTML(tokentree,true) with tokentree="+JSON.stringify(tokentree,null,4));
      var out = convertToHTML(tokentree, true);
      console.log("sceditor/formats/mediawiki.js:4487 - after calling convertToHTML(tokentree,true) with out='"+out+"'");
      //----------------------------------------
			//---- DETOKENIZE for HTML ---------------
      //out = detokenizeCitation(out,doc,"html");
      out = detokenizeMath(out,doc,"html");
      console.log("sceditor/formats/mediawiki.js:4492 - after detokenizeMath/Citation(out,doc) with out='"+out+"'");
      //----------------------------------------
      // call update MathJax in sceditor after DOM is updated
      //----------------------------------------
      return out;
		};

		/**
		 * @private
		 */

     function isMathToken(token) {
       var bool = false;
       if (token && token.name) {
         if (token.name == "math") {
           bool = true;
         } else if (token.name == "mathinline") {
           bool = true
         } else if (token.name == "mathblock") {
           bool = true
         }
       }
       return bool;
     }

    function convertToLatex(tokens, isRoot) {
      var token, ret = '';
      while (tokens.length > 0) {
				if (!(token = tokens.shift())) {
					continue;
				}
        if (token.type === TOKEN_NEWLINE) {
          ret +="\n";
        } else {
          ret += token.val;
        }
      }
      return ret;
    }

    function convertToHTML(tokens, isRoot) {
			var	undef, token, mediawiki, content, html, needsBlockWrap,
				blockWrapOpen, isInline, lastChild,
				ret = '';

			isInline = function (mediawiki) {
				return (!mediawiki || (mediawiki.isHtmlInline !== undef ?
					mediawiki.isHtmlInline : mediawiki.isInline)) !== false;
			};


			while (tokens.length > 0) {
				if (!(token = tokens.shift())) {
					continue;
				}
        //alert("sceditor/formats/mediawiki.js:1983 - ret='"+ret+"' token="+JSON.stringify(token, null, 4));
        if (token.type === TOKEN_OPEN) {
          if (isMathToken(token) == true) {
            //alert("sceditor/formats/mediawiki.js:2913 - MATH CONTENT token="+JSON.stringify(token,null,4));
            //content = "XXX MATH TOKEN XXX";
          }
        }
				if (token.type === TOKEN_OPEN) {
					lastChild = token.children[token.children.length - 1] || {};
					mediawiki = mediawikiHandlers[token.name];
          //console.log("sceditor/formats/mediawiki.js:4606 - convertToHTML(tokens,isRoot='"+isRoot+"') token="+JSON.stringify(token,null,4));

					needsBlockWrap = isRoot && isInline(mediawiki);
          if (isMathToken(token) == true) {
            content = convertToLatex(token.children, false);
          } else {
            content = convertToHTML(token.children, false);
          }
					if (mediawiki && mediawiki.html) {
						// Only add a line break to the end if this is
						// blocklevel and the last child wasn't block-level
						if (!isInline(mediawiki) &&
							isInline(mediawikiHandlers[lastChild.name]) &&
							!mediawiki.isPreFormatted &&
							!mediawiki.skipLastLineBreak) {
							// Add placeholder br to end of block level
							// elements
              //alert("token.type='"+token.type+"' token.name='"+token.name+"' lastChild.name='"+lastChild.name+"'");
							content += '<br />';
						}

						if (!isFunction(mediawiki.html)) {
              // standard token/template replacement
              token.attrs['0'] = content;
              // formatMediaWikiString takes a template from "templates"
              // and renders content and attributes for the template
							html = formatMediaWikiString(
								mediawiki.html,
								token.attrs
							);
						} else {
							html = mediawiki.html.call(
								base,
								token,
								token.attrs,
								content
							);
						}
					} else {
						html = token.val + content +
							(token.closing ? token.closing.val : '');
					}
        } else if (token.type === TOKEN_HEADER) {
          /*
          {
            "type": "header",
            "name": "h2",
            "val": "Header 1",
            "attrs": {},
            "children": [],
            "closing": null
          }
          */
          var header_tag = '<'+token.name+'> '+token.val+' </'+token.name+'>';
          console.log("sceditor/formats/mediawiki.js:2074 - header_tag='"+header_tag+"' type='"+token.type+"'")
          ret += header_tag;
          html = '';
          //alert("sceditor/formats/mediawiki.js:2035 - ret='"+ret+"' token="+JSON.stringify(token, null, 4));
				} else if (token.type === TOKEN_NEWLINE) {
					if (!isRoot) {
						ret += '<br />';
						continue;
					}

					// If not already in a block wrap then start a new block
					if (!blockWrapOpen) {
						ret += '<div>';
					}

					ret += '<br />';

					// Normally the div acts as a line-break with by moving
					// whatever comes after onto a new line.
					// If this is the last token, add an extra line-break so it
					// shows as there will be nothing after it.
					if (!tokens.length) {
						ret += '<br class="tokenlength"/>';
					}

					ret += '</div>\n';
					blockWrapOpen = false;
					continue;
				// content
				} else {
					needsBlockWrap = isRoot;
					html           = escapeEntities(token.val, true);
				}
        //alert("sceditor/formats/mediawiki.js:2066 - ret='"+ret+"' token="+JSON.stringify(token, null, 4));

				if (needsBlockWrap && !blockWrapOpen) {
					ret += '<div>';
					blockWrapOpen = true;
				} else if (!needsBlockWrap && blockWrapOpen) {
					ret += '</div>\n';
					blockWrapOpen = false;
				}

				ret += html;
			}

			if (blockWrapOpen) {
				ret += '</div>\n';
			}

			return ret;
		}

    function sanitize_sourcecode(str) {
      console.log("sceditor/formats/mediawiki.js:2208 - sanitize_sourcecode('"+str+"')");
      str = str.replace(/^[\s\n]+|[\s\n]+$/g, '');
      //str = str.replace(/[\n\s]*\n(=[=]+)/g,function (pMatch,pPrefix) {
      //    return "\n\n"+pPrefix;
      //});
      console.log("sceditor/formats/mediawiki.js:2215 - sanitize_sourcecode(str) sanitized string '"+str+"')");
      return str;
    }

		/**
		 * Takes a MediaWiki string, parses it then converts it back to MediaWiki.
		 *
		 * This will auto fix the MediaWiki and format it with the specified
		 * options.
		 *
		 * @param {string} str
		 * @param {boolean} preserveNewLines If to preserve all new lines, not
		 *                                strip any based on the passed
		 *                                formatting options
		 * @return {string}
		 * @memberOf MediaWikiParser.prototype
		 */
		base.toMediaWikiCode = function (str, preserveNewLines) {
      var tokenlist = base.parse(str, preserveNewLines);
      console.log("sceditor/formats/mediawiki.js:4962 - toMediaWikiCode(str) tokentree="+JSON.stringify(tokentree,null,4));
			var str = convertToMediaWikiCode(tokentree);
      return sanitize_sourcecode(str);
		};

    function skipLastLineBreaks(pChildren) {
      console.log("sceditor/formats/mediawiki.js:4920 - skipLastLineBreaks(pChildren) pChildren="+JSON.stringify(pChildren,null,4));
      if (pChildren && pChildren.length > 0) {
        // child to last child of pChildren
        var child = pChildren[pChildren.length-1];
        while (child) {
          // check if it is a newline
          if (child.val && child.val == "\n") {
            // it is "\n" so remove last linebreak
            pChildren.pop();
            // check if pChildren contains still tokens
            if (pChildren.length > 0) {
              // pChildren not empty array, set to last child
              child = pChildren[pChildren.length-1];
            } else {
              child = null;
            }
          } else {
            child = null;
          }
        }
      }
    }

    function checkAllowChildren(pToken,mediawiki) {
      var ret = false;
      if (mediawiki) {
        if (mediawiki.allowedChildren) {
          var ac = mediawiki.allowedChildren;
          // pParent exists with an appropriate mediawiki handler
          if (ac.indexOf(pToken.name) >= 0) {
            // type of token is a valid token,
            // because listed among allowed children
            ret = true;
          } else {
            // are all child nodes allowed
            if (ac.indexOf("*") >= 0) {
              ret = true;
            }
          }
        } else {
          // mediawiki Handler exists  but handler of parent node
          // does not have "allowedChildren" as attribute
          ret = true;
        }
      } else {
        // mediawiki Handler of parent node does not exist
        ret = true;
      }
      return ret;
    }

    function tokenAllowed(pToken,pParent) {
      var ret;
      if (!pToken) {
        return false;
      }
      var mediawiki4child, mediawiki;
      if (pToken.name) {
        mediawiki4child = mediawikiHandlers[pToken.name];
      }
      // now check if parent allows this pChild.
      if (pParent && pParent.name) {
        mediawiki = mediawikiHandlers[pParent.name];
      };
      switch (pToken.type) {
        case "content":
          if (pToken.val == "\n") {
            pToken.type = "newline";
            pToken.name = "#newline";
            if (mediawiki) {
              return checkAllowChildren(pToken,mediawiki);
            }
          } else {
            return true;
          }
        break;
        case "header":
          return true;
        break;
        case "newline":
          //alert("Child.type '"+pToken.type+"' (val='"+pToken.val+"') of Parent '"+((pParent && pParent.name) || "root")+"' is checked.")
          if (mediawiki) {
            if (mediawiki.ignoreLineBreak && (mediawiki.ignoreLineBreak == true)) {
              return false;
            } else {
              // newline maybe not allowed as child of table
              //alert("checkAllowChildren(token newline)")
              ret = checkAllowChildren(pToken,mediawiki);
            }
          } else {
            ret = true;
          }
        break;
        default:
          // default case - if no mediawiki handler exists - token is not allowed
          if (!mediawiki4child) {
            return false;
          }
      }
      if (mediawiki) {
        ret = checkAllowChildren(pToken,mediawiki);
      }
      return ret;
    }

    function fixAllowedChildren(tokentree,pParent) {
      var tok;
      if (tokentree && Array.isArray(tokentree)) {
        for (var i = tokentree.length-1; i >= 0; i--) {
          tok = tokentree[i];
          // token allowed is testing against existing mediawiki handler
          if (tokenAllowed(tok,pParent) == false) {
            //alert("sceditor/formats/mediawiki.js:5048 - Child '"+tok.name+"' (val='"+tok.val+"') of Parent '"+((pParent && pParent.name) || "root")+"' is not allowed.")
            tokentree.splice(i,1);
          } else {
            //alert("sceditor/formats/mediawiki.js:5062 - Child '"+tok.name+"' (val='"+tok.val+"') of Parent '"+((pParent && pParent.name) || "root")+"' is allowed.")
          }
          // the token 'tok' has children, so fix also the children
          // with tok as parent AST node.
          if (tok && tok.children && (tok.children.length > 0)) {
            fixAllowedChildren(tok.children,tok);
          }
        }
      } else {
        console.error("fixAllowedChildren(tokentree) tokentree as array is missing.");
      }
    }

		/**
		 * Converts parsed tokens back into MediaWiki with the
		 * formatting specified in the options and with any
		 * fixes specified.
		 *
		 * @param  {array} toks Array of parsed tokens from base.parse()
		 * @return {string}
		 * @private
		 */
		function convertToMediaWikiCode(toks) {
			var	token, attr, mediawiki, isBlock, isSelfClosing, quoteType,
				breakBefore, breakStart, breakEnd, breakAfter,
				ret = '';

			while (toks.length > 0) {
				if (!(token = toks.shift())) {
					continue;
				}
				// TODO: tidy this
        console.log("sceditor/formats/mediawiki.js:4789 - token.name='"+token.name+"' token.type='"+token.type+"' token="+token.outerHTML);
				mediawiki        = mediawikiHandlers[token.type];
        console.log("sceditor/formats/mediawiki.js:4791 - token handler for '"+token.name+"' mediawikiHandlers['"+token.type+"']="+( mediawiki ? JSON.stringify(mediawiki,null,4) : "'"+token.val + "'"));
				isBlock       = !(!mediawiki || mediawiki.isInline !== false);
				isSelfClosing = mediawiki && mediawiki.isSelfClosing;

				breakBefore = (isBlock && base.opts.breakBeforeBlock &&
						mediawiki.breakBefore !== false) ||
					(mediawiki && mediawiki.breakBefore);

				breakStart = (isBlock && !isSelfClosing &&
						base.opts.breakStartBlock &&
						mediawiki.breakStart !== false) ||
					(mediawiki && mediawiki.breakStart);

				breakEnd = (isBlock && base.opts.breakEndBlock &&
						mediawiki.breakEnd !== false) ||
					(mediawiki && mediawiki.breakEnd);

				breakAfter = (isBlock && base.opts.breakAfterBlock &&
						mediawiki.breakAfter !== false) ||
					(mediawiki && mediawiki.breakAfter);

				quoteType = (mediawiki ? mediawiki.quoteType : null) ||
					base.opts.quoteType || QuoteType.auto;

				if (!mediawiki && token.type === TOKEN_OPEN) {
					ret += token.val;

					if (token.closing) {
						ret += token.closing.val;
					}
				} else if (token.type === TOKEN_OPEN) {
					if (breakBefore) {
						ret += '\n';
					}

					// Convert the tag and it's attributes to MediaWiki
					ret += '[' + token.name;
					if (token.attrs) {
						if (token.attrs.defaultattr) {
							ret += '=' + quote(
								token.attrs.defaultattr,
								quoteType,
								'defaultattr'
							);

							delete token.attrs.defaultattr;
						}

						for (attr in token.attrs) {
							if (token.attrs.hasOwnProperty(attr)) {
								ret += ' ' + attr + '=' +
									quote(token.attrs[attr], quoteType, attr);
							}
						}
					}
					ret += ']';

					if (breakStart) {
						ret += '\n';
					}

					// Convert the tags children to MediaWiki
					if (token.children) {
						ret += convertToMediaWikiCode(token.children);
					}

					// add closing tag if not self closing
					if (!isSelfClosing && !mediawiki.excludeClosing) {
						if (breakEnd) {
							ret += '\n';
						}

						ret += '</' + token.name + '>';
					}

					if (breakAfter) {
						ret += '\n';
					}

					// preserve whatever was recognized as the
					// closing tag if it is a self closing tag
					if (token.closing && isSelfClosing) {
						ret += token.closing.val;
					}
				} else if (token.type === TOKEN_HEADER) {
          ret += "\n"+tag_delimiter[token.name]+" "+token.val+" "+tag_delimiter[token.name];
        } else {
					ret += token.val;
				}
			}

			return ret;
		}

		/**
		 * Quotes an attribute
		 *
		 * @param {string} str
		 * @param {MediaWikiParser.QuoteType} quoteType
		 * @param {string} name
		 * @return {string}
		 * @private
		 */
		function quote(str, quoteType, name) {
			var	needsQuotes = /\s|=/.test(str);

			if (isFunction(quoteType)) {
				return quoteType(str, name);
			}

			if (quoteType === QuoteType.never ||
				(quoteType === QuoteType.auto && !needsQuotes)) {
				return str;
			}

			return '"' + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
		}

		/**
		 * Returns the last element of an array or null
		 *
		 * @param {array} arr
		 * @return {Object} Last element
		 * @private
		 */
		function last(arr) {
			if (arr.length) {
				return arr[arr.length - 1];
			}

			return null;
		}

		/**
		 * Converts a string to lowercase.
		 *
		 * @param {string} str
		 * @return {string} Lowercase version of str
		 * @private
		 */
		function lower(str) {
      var ret = "";
      if (str) {
        ret = str.toLowerCase();
      }
			return ret;
		}
	};

	/**
	 * Quote type
	 * @type {Object}
	 * @class QuoteType
	 * @name MediaWikiParser.QuoteType
	 * @since 1.4.0
	 */
	MediaWikiParser.QuoteType = QuoteType;

	/**
	 * Default MediaWiki parser options
	 * @type {Object}
	 */
	MediaWikiParser.defaults = {
		/**
		 * If to add a new line before block level elements
		 *
		 * @type {Boolean}
		 */
		breakBeforeBlock: false,

		/**
		 * If to add a new line after the start of block level elements
		 *
		 * @type {Boolean}
		 */
		breakStartBlock: false,

		/**
		 * If to add a new line before the end of block level elements
		 *
		 * @type {Boolean}
		 */
		breakEndBlock: false,

		/**
		 * If to add a new line after block level elements
		 *
		 * @type {Boolean}
		 */
		breakAfterBlock: true,

		/**
		 * If to remove empty tags
		 *
		 * @type {Boolean}
		 */
		removeEmptyTags: true,

		/**
		 * If to fix invalid nesting,
		 * i.e. block level elements inside inline elements.
		 *
		 * @type {Boolean}
		 */
		fixInvalidNesting: true,

		/**
		 * If to fix invalid children.
		 * i.e. A tag which is inside a parent that doesn't
		 * allow that type of tag.
		 *
		 * @type {Boolean}
		 */
		fixInvalidChildren: true,

		/**
		 * Attribute quote type
		 *
		 * @type {MediaWikiParser.QuoteType}
		 * @since 1.4.1
		 */
		quoteType: QuoteType.auto,

		/**
		 * Whether to use strict matching on attributes and styles.
		 *
		 * When true this will perform AND matching requiring all tag
		 * attributes and styles to match.
		 *
		 * When false will perform OR matching and will match if any of
		 * a tags attributes or styles match.
		 *
		 * @type {Boolean}
		 * @since 3.1.0
		 */
		strictMatch: false
	};

	/**
	 * Converts a number 0-255 to hex.
	 *
	 * Will return 00 if number is not a valid number.
	 *
	 * @param  {any} number
	 * @return {string}
	 * @private
	 */
	function toHex(number) {
		number = parseInt(number, 10);

		if (isNaN(number)) {
			return '00';
		}

		number = Math.max(0, Math.min(number, 255)).toString(16);

		return number.length < 2 ? '0' + number : number;
	}
  function _normaliseDisplay(displayStr) {
    var display = "inline";
    if (displayStr) {
      display = displayStr.replace(/[^a-zA-Z]/g,"");
    }
    return display
  }
  /**
	 * Normalises a CSS colour to hex #xxxxxx format
	 *
	 * @param  {string} colorStr
	 * @return {string}
	 * @private
	 */
	function _normaliseColour(colorStr) {
		var match;

		colorStr = colorStr || '#000';

		// rgb(n,n,n);
		if ((match =
			colorStr.match(/rgb\((\d{1,3}),\s*?(\d{1,3}),\s*?(\d{1,3})\)/i))) {
			return '#' +
				toHex(match[1]) +
				toHex(match[2]) +
				toHex(match[3]);
		}

		// expand shorthand
		if ((match = colorStr.match(/#([0-f])([0-f])([0-f])\s*?$/i))) {
			return '#' +
				match[1] + match[1] +
				match[2] + match[2] +
				match[3] + match[3];
		}

		return colorStr;
	}


  function handle_traverse4id(doc,str_start,str_content, str_end, id_prefix) {
        id_prefix = id_prefix || "TRAVERSE4ID";
        var out_rec = {
            "id":      get_unique_id(id_prefix),
            "start":   str_start,
            "match":   str_match,
            "end":     str_end
        };
        if (doc && doc.mathexpr) {
          doc.mathexpr.push(out_rec);
        }
        return out_rec.id;
  }


  function handle_traverse_match(doc,str_start,str_content, str_end,id_prefix) {
        id_prefix = id_prefix || "TRAVERSE4ID";
        var out_rec = {
            "id":      get_unique_id(id_prefix),
            "start":   str_start,
            "content": str_content,
            "end":     str_end
        };
        if (doc && doc.mathexpr) {
          doc.mathexpr.push(out_rec);
        }
        return str_content;
  }

  function traverse4Source(str,doc,regx_start,regx_end,callback,id_prefix) {
        var wikicode = str;
        var vResult;
        var out = "";
        var out_rec;
        callback = callback || handle_traverse4id;
        id_prefix = id_prefix || "TRAVERSE4ID";
        var str_start, str_match, str_end;
        if (str) {
          // find regx_start in string as long as it matches (while)
          wikicode = str;
          // wikicode will be modified after match
          if (regx_start) {
            // find the start working condition
            while (vResult = regx_start.exec(wikicode)) {
              vCount++;
    					console.log("sceditor/formats/mediawiki.js:4343 - traverse4Source()-Call "+vCount+": Start: '" + vResult[1] + "' found");
              str_start = vResult[1];
              var i_start = wikicode.indexOf(str_start);
              if (i_start >= 0) {
                // append string until string start.
                out += wikicode.substr(0,i_start);
                wikicode = wikicode.substring(i_start+vSearch.length, wikicode.length);
                //--- Now wikicode starts after the begin match
                //--- search for regx_end in rest of str
                if (vResult = regx_end.exec(wikicode)) {
                  str_end = vResult[1];
                  var i_end = wikicode.indexOf(str_end);
                  if (i_end >= 0) {
                      //--- end of match was found
                      str_match = wikicode.substr(0,i_end);
                      str_end = wikicode.substr(i_end,str_end.length);
                      // submit the matches consisting of
                      // - "start_match" string,
                      // - "str_match" as matched content and the
                      // - "end_match" as the match of regx_end to the callback
                      callback(doc,str_start,str_match,str_end,id_prefix);
                      //--- removed the matched string from wikicode
                      wikicode = wikicode.substring(i_end);
                   }
                };
              }
              out += wikicode;
            }
          }
        }
        // return the processed environment
        return out;
  }


  /**
   * Normalises a CSS colour to hex #xxxxxx format
   *
   * @param  {string} colorStr
   * @return {string}
   * @private
   */
  function _normaliseLink(link) {
    return encodeURIComponent(link);
  }
	/**
	 * SCEditor MediaWiki format
	 * @since 2.0.0
	 */
	function mediawikiFormat() {
		var base = this;

		base.stripQuotes = _stripQuotes;

		/**
		 * cache of all the tags pointing to their mediawikis to enable
		 * faster lookup of which mediawiki a tag should have
		 * @private
		 */
		var tagsToMediaWiki = {};

		/**
		 * Allowed children of specific HTML tags. Empty array if no
		 * children other than text nodes are allowed
		 * @private
		 */
		var validChildren = {
			ul: ['li','br'],
			ol: ['li','br'],
      dl: ['dt', 'dd','br'],
      li: ['url', 'i','b','img','ul','ol','dl'],
      table: ['tr','caption'],
			tr: ['td', 'th'],
			code: ['br', 'p', 'div']
		};

		/**
		 * Populates tagsToMediaWiki and stylesToMediaWikis for easier lookups
		 *
		 * @private
		 */
		function buildMediawikiCache() {
			each(mediawikiHandlers, function (mediawiki, handler) {
				var
					isBlock = handler.isInline === false,
					tags   = mediawikiHandlers[mediawiki].tags,
					styles = mediawikiHandlers[mediawiki].styles;

				if (styles) {
					tagsToMediaWiki['*'] = tagsToMediaWiki['*'] || {};
					tagsToMediaWiki['*'][isBlock] =
						tagsToMediaWiki['*'][isBlock] || {};
					tagsToMediaWiki['*'][isBlock][mediawiki] = [
						['style', Object.entries(styles)]
					];
				}

				if (tags) {
					each(tags, function (tag, values) {
						if (values && values.style) {
							values.style = Object.entries(values.style);
						}

						tagsToMediaWiki[tag] = tagsToMediaWiki[tag] || {};
						tagsToMediaWiki[tag][isBlock] =
							tagsToMediaWiki[tag][isBlock] || {};
						tagsToMediaWiki[tag][isBlock][mediawiki] =
							values && Object.entries(values);
					});
				}
			});
		};

		/**
		 * Handles adding newlines after block level elements
		 *
		 * @param {HTMLElement} element The element to convert
		 * @param {string} content  The tags text content
		 * @return {string}
		 * @private
		 */
		function handleBlockNewlines(element, content) {
			var	tag = element.nodeName.toLowerCase();
			var isInline = dom.isInline;
			if (!isInline(element, true) || tag === 'br') {
				var	isLastBlockChild, parent, parentLastChild,
					previousSibling = element.previousSibling;

				// Skips selection makers and ignored elements
				// Skip empty inline elements
				while (previousSibling &&
						previousSibling.nodeType === 1 &&
						!is(previousSibling, 'br') &&
						isInline(previousSibling, true) &&
						!previousSibling.firstChild) {
					previousSibling = previousSibling.previousSibling;
				}

				// If it's the last block of an inline that is the last
				// child of a block then it shouldn't cause a line break
				// <block><inline><br></inline></block>
				do {
					parent          = element.parentNode;
					parentLastChild = parent && parent.lastChild;

					isLastBlockChild = parentLastChild === element;
					element = parent;
				} while (parent && isLastBlockChild && isInline(parent, true));

				// If this block is:
				//	* Not the last child of a block level element
				//	* Is a <li> tag (lists are blocks)
				if (!isLastBlockChild || tag === 'li') {
					content += '\n';
				}

				// Check for:
				// <block>text<block>text</block></block>
				//
				// The second opening <block> opening tag should cause a
				// line break because the previous sibing is inline.
				if (tag !== 'br' && previousSibling &&
					!is(previousSibling, 'br') &&
					isInline(previousSibling, true)) {
					content = '\n' + content;
				}
			}

			return content;
		}

		/**
		 * Handles a HTML tag and finds any matching MediaWikis
		 *
		 * @param {HTMLElement} element The element to convert
		 * @param {string} content  The Tags text content
		 * @param {boolean} blockLevel
		 * @return {string} Content with any matching MediaWiki tags
		 *                  wrapped around it.
		 * @private
		 */
		function handleTags(element, content, blockLevel) {
			function isStyleMatch(style) {
				var property = style[0];
				var values = style[1];
				var val = dom.getStyle(element, property);
				var parent = element.parentNode;

				// if the parent has the same style use that instead of this one
				// so you don't end up with [i]parent[i]child[/i][/i]
				if (!val || parent && dom.hasStyle(parent, property, val)) {
					return false;
				}

				return !values || values.includes(val);
			}

			function createAttributeMatch(isStrict) {
				return function (attribute) {
					var name = attribute[0];
					var value = attribute[1];

					// code tags should skip most styles
					if (name === 'style' && element.nodeName === 'CODE') {
						return false;
					}

					if (name === 'style' && value) {
						return value[isStrict ? 'every' : 'some'](isStyleMatch);
					} else {
						var val = attr(element, name);

						return val && (!value || value.includes(val));
					}
				};
			}

			function handleTag(tag) {
				if (!tagsToMediaWiki[tag] || !tagsToMediaWiki[tag][blockLevel]) {
					return;
				}

				// loop all mediawiki content for this tag
				each(tagsToMediaWiki[tag][blockLevel], function (mediawiki, attrs) {
					var fn, format;
          var mw = mediawikiHandlers[mediawiki];
					var	isStrict = mw && mw.strictMatch;

					if (typeof isStrict === 'undefined') {
						isStrict = base.opts.strictMatch;
					}

					// Skip if the element doesn't have the attribute or the
					// attribute doesn't match one of the required values
					fn = isStrict ? 'every' : 'some';
					if (attrs && !attrs[fn](createAttributeMatch(isStrict))) {
						return;
					}

					format = mw.format;
					if (isFunction(format)) {
						content = format.call(base, element, content);
					} else {
						content = _formatString(format, content);
					}
          if (mw && mw.skipLastLineBreak && mw.skipLastLineBreak == true) {
            //alert("sceditor/formats/mediawiki.js:5735 - skipLastLineBreak(content) content='"+content+"'");
            if (content) {
              content = content.replace(/[\n]+$/,"");
            }
          }
					return false;
				});
			}

			handleTag('*');
			handleTag(element.nodeName.toLowerCase());
			return content;
		}

		/**
		 * Converts a HTML dom element to MediaWiki starting from
		 * the innermost element and working backwards
		 *
		 * @private
		 * @param {HTMLElement}	element
		 * @return {string} MediaWiki
		 * @memberOf SCEditor.plugins.mediawiki.prototype
		 */
		function elementToMediawiki(element) {
      console.log("sceditor/formats/mediawiki.js:5401 - elementToMediawiki('"+(element.tagName || "#")+"')");
			var toMediaWikiCode = function (node, vChildren) {
				var ret = '';

				dom.traverse(node, function (node) {
					var	content      = '',
						nodeType     = node.nodeType,
						tag          = node.nodeName.toLowerCase(),
						vChild       = validChildren[tag],
						firstChild   = node.firstChild,
						isValidChild = true;

					if (typeof vChildren === 'object') {
						isValidChild = vChildren.indexOf(tag) > -1;

						// Emoticons should always be converted
						if (is(node, 'img') && attr(node, EMOTICON_DATA_ATTR)) {
							isValidChild = true;
						}

						// if this tag is one of the parents allowed children
						// then set this tags allowed children to whatever it
						// allows, otherwise set to what the parent allows
						if (!isValidChild) {
							vChild = vChildren;
						}
					}

					// 3 = text and 1 = element
					if (nodeType !== 3 && nodeType !== 1) {
						return;
					}

					if (nodeType === 1) {
						// skip empty nlf elements (new lines automatically
						// added after block level elements like quotes)
						if (is(node, '.sceditor-nlf') && !firstChild) {
							return;
						}

						// don't convert iframe contents
						if (tag !== 'iframe') {
							content = toMediaWikiCode(node, vChild);
						}

						// TODO: isValidChild is no longer needed. Should use
						// valid children mediawikis instead by creating MediaWiki
						// tokens like the parser.
						if (isValidChild) {
							// code tags should skip most styles
							if (tag !== 'code') {
								// First parse inline codes
								content = handleTags(node, content, false);
							}

							content = handleTags(node, content, true);
							ret += handleBlockNewlines(node, content);
						} else {
							ret += content;
						}
					} else {
						ret += node.nodeValue;
					}
				}, false, true);

				return ret;
			};

			return toMediaWikiCode(element);
		};

		/**
		 * Initializer
		 * @private
		 */
		base.init = function () {
			base.opts = this.opts;
			base.elementToMediawiki = elementToMediawiki;

			// build the MediaWiki cache
			buildMediawikiCache();

			this.commands = extend(
				true, {}, defaultCommandsOverrides, this.commands
			);

			// Add MediaWiki helper methods
			this.toMediaWikiCode   = base.toSource;
			this.fromMediaWikiCode = base.toHtml;
		};

    function text2lines(wikicode) {
      console.log("sceditor/formats/mediawiki.js:2606 - text2lines(wikicode)-Call - wikicode='"+wikicode+"'");
      var lines = [];
      if (wikicode) {
        lines = wikicode.split(/[\s]*?\r?\n/);
      }
      return lines;
    }

    function header2id(pHeader) {
      var vHeader = pHeader || ("Header"+Date.now());
      vHeader = vHeader.replace(/[^A-Za-z0-9]/g,"_");

      return vHeader;

    };
    //----End of Method header2id Definition

    function  convert_header(match,level,outFormat) {
      outFormat = outFormat || "html";
      console.log("convert_header()-call: match='"+match+"' at level="+level+".");
      var delimiter = ["","=","==","===","====","=====","======"];
      //var delimiter = ["","_","__","___","____","_____","______"];
      // header command
      var texopen = ["","\\chapter{","\\section{","\\subsection{","\\subsubsection{","\\paragraph{","\\","\\subparagraph{"]
      var texclose = ["","}","}","}","}","}","} \\quad \\\\"]
      var out = "";
      switch (autFormat) {
        case "html":
          //out += delimiter[level] + match + delimiter[level] + "\n";
          out += "<h"+level+" id=\""+TOKEN_2id(match)+"\">"+match+"</h"+level+">"
        break;
        case "latex":
          //out += delimiter[level] + match + delimiter[level] + "\n";
          out += texopen[level] + match + texclose[level]+ " \\label{"+this.TOKEN_2id(match)+"}"
        break;
        case "reveal":
          //out += delimiter[level] + match + delimiter[level] + "\n";
          if (this.aSectionCount > 0) {
              out += "</div>";
              out += "</section>\n";
          };
          this.aSectionCount++;
          out += "<section class=\"level"+level+"\" id=\""+this.header2id(match)+"\">\n\t<h"+level+">"+match+"</h"+level+">"
          out += "\n<div class=\"textleft\" style=\"text-align: left;\">\n";
          //if (document.location.href.indexOf("reveal") >= 0) {
          //	out += '<p class="fragment" doc-audio-src="audio/silence.ogg">';
          //}
          break;
        default:
          out += delimiter[level] + match + delimiter[level] + "\n";
      };
      return out
    }

    function replaceSections (lines) {
  			// split wikicode into an array of lines
        var line = "";
  			console.log("sceditor/formats/mediawiki.js:2606 - replaceSections()-Call based on wiky.js");
  			console.log("wikicode has "+lines.length+" lines.");
  			var title = "";
  			var level = 0;
  			var i=0;
  			while (i<lines.length) {
  				console.log("("+(i+1)+"/"+lines.length+") LINE iteration for section");
  				line = lines[i] || "";
  				if (line) {
  				 	console.log("Line "+(i+1)+" Checker");
  					if (line.match(/^======/)!=null && line.match(/======$/)!=null) {
  						level = 6;
  						title = line.substring(level,line.length-level);
  						lines[i] = convert_TOKEN_(title,level);
  					} else if (line.match(/^=====/)!=null && line.match(/=====$/)!=null) {
  						level = 5;
  						title = line.substring(level,line.length-level);
  						lines[i] = convert_TOKEN_(title,level);
  					} else if (line.match(/^====/)!=null && line.match(/====$/)!=null) {
  						level = 4;
  						title = line.substring(level,line.length-level);
  						lines[i] = convert_TOKEN_(title,level);
  					} else if (line.match(/^===/)!=null && line.match(/===$/)!=null) {
  						level = 3;
  						title = line.substring(level,line.length-level);
  						lines[i] = convert_TOKEN_(title,level);
  					} else if (line.match(/^==/)!=null && line.match(/==$/)!=null) {
  						level = 2;
  						title = line.substring(level,line.length-level);
  						lines[i] = convert_TOKEN_(title,level);
  					}
          }
  				i++;
  				console.log("("+(i)+"/"+lines.length+") LINE END iteration end line="+(lines[i] || "undefined"));
  			};
  			return lines;

  	};
  	//----End of Method replaceSections Definition


    /**
     * Preprocess MediaWiki for HTML
     *
     * @param {string} source
     */
     function preprocessHtml(pSource) {
       console.log("sceditor/sceditor.js:2662 - CALL: preprocessHtml('mediawiki') pSource='"+pSource+"'");
       var lines = text2lines(pSource);
       console.log("text2lines(pSource) create "+lines.length+" lines.");
       lines = replaceSections(lines);
       console.log("After conversion - text2lines(pSource) create "+lines.length+" lines.");
       return lines.join("\n");
     }

		/**
		 * Converts MediaWiki into HTML
		 *
		 * @param {boolean} asFragment
		 * @param {string} source
		 * @param {boolean} [legacyAsFragment] Used by fromMediaWikiCode() method
		 */
		function toHtml(asFragment, source, legacyAsFragment) {
      // toHTML is call from toHtml() method
      console.log("sceditor/sceditor.js:5532 - CALL: toHtml('mediawiki') source='"+source+"'");

      if (source) {
        //source = preprocessHtml(source);
        //console.log("sceditor/formats/mediawiki.js:2680 - preprocessHtml(source) = '"+preprocessHtml(source)+"'" );
      }

			var	parser = new MediaWikiParser(base.opts.parserOptions);
			var html = parser.toHTML(
				base.opts.mediawikiTrim ? source.trim() : source
			);
      console.log("sceditor/sceditor.js:5543 - CALL: toHtml('mediawiki') html='"+html+"'");

			if (asFragment || legacyAsFragment) {
        html = removeFirstLastDiv(html)
      }
			return html;
  	}

    /**
     * Converts MediaWiki into HTML
     *
     * @param {boolean} asFragment
     * @param {string} source
     * @param {boolean} [legacyAsFragment] Used by fromMediaWikiCode() method
     */
    function toTree(source) {
      // toTREE is call from toHtml() method
      console.log("sceditor/formats/src/mediawiki10_preprocessor.js:52 - CALL: toTree('mediawiki') source='"+source+"'");

      var	parser = new MediaWikiParser(base.opts.parserOptions);
      var tokentree = parser.toTREE(
        base.opts.mediawikiTrim ? source.trim() : source
      );
      console.log("sceditor/formats/src/mediawiki10_preprocessor.js:58 - CALL: toTree('mediawiki') source='"+source+"'");

      return tokentree;
    }

    function traverseSource(node, func, innermostFirst, siblingsOnly, reverse) {
      node = reverse ? node.lastChild : node.firstChild;
      console.log("sceditor/formats/mediawiki.js:5635 - node.tagName='"+((node && node.tagName) || "#")+"' ")

      while (node) {
        var next = reverse ? node.previousSibling : node.nextSibling;
        if (
          (!innermostFirst && func(node) === false) ||
          (!siblingsOnly && traverseSource(
            node, func, innermostFirst, siblingsOnly, reverse
          ) === false) ||
          (innermostFirst && func(node) === false)
        ) {
          return false;
        }

        node = next;
      }
    }

    function traverseMath4Source(node,doc) {
      // traverse HTML DOM tree and compress SVG math expression into a <math> tag
      var mathtags = [];
      //alert("sceditor/formats/mediawiki.js:3902 - traverseMath4Source(node) node.type='"+node.outerHTML+"' ");
      traverseSource(node, function (node) {
        //console.log("sceditor/formats/mediawiki.js:5658 - traverseMath4Source(node) node.tagName='"+(node.tagName || "text") +"' ");
        // find the mathjax editor links and replace them with a math-tag
        // the math-tag should contain the latex code that is stored in the
        // latex-attribute of the a-tag <a onclick="..." latex="....">...</a>
        if (node && node.classList && node.classList.contains(CLASS_MATH_EDIT)) {
          // this is an a-tag with a rendered MathJax expressioned
          // parent node in editor is a 'span' oder 'div'
          //<span id="MATH4T1688632679003C7" class="mathinline"> ...</span>
          var parent = node.parentNode;
          var mathdisplay = "inline";
          if (parent.classList.contains(TOKEN_MATH_INLINE)) {
            mathdisplay = "inline";
          }
          if (parent.classList.contains(TOKEN_MATH_BLOCK)) {
            mathdisplay = "block";
          }
          var latex = node.getAttribute("latex");
          if (latex) {
            console.log("sceditor/formats/mediawiki.js:3921 - Math['" + parent.id + "'].display = '"+mathdisplay+"' with latex='"+latex+"' found!");
            //alert("sceditor/formats/mediawiki.js:3921 - Math['" + parent.id + "'].display = '"+mathdisplay+"' with latex='"+latex+"' found!");
          } else {
            latex = "math-undefined";
          }
          var id4math = "";
          var vLabel = "___MATH_" + (mathdisplay.toUpperCase()) + "_"+doc.timeid+"_ID_"+doc.count+"___";
          if (parent && parent.id) {
            id4math = " id=\"" + parent.id +"\"";
            vLabel = parent.id;
          }
          doc.mathexpr.push({
            "type":  mathdisplay,
            "attrs": "display='"+mathdisplay+"'",
            "label": vLabel,
            "math":  latex
          });
          //parent.outerHTML = " <math display=\""+mathdisplay+"\""+id4math+">"+ latex +"</math> ";
          parent.outerHTML = vLabel;
          //node.insertBefore() = ""
        };
      });
    }

    function calculatePrefix(node) {
      var prefix = "";
      while (node) {
        if (node && node.tagName) {
          var tagName = node.tagName.toLowerCase();
          switch (tagName) {
            case "ul":
              prefix = "*"+prefix;
              //node.setAttribute("listprefix",prefix);
            break;
            case "ol":
              prefix = "#"+prefix;
              //node.setAttribute("listprefix",prefix);
            break;
            case "dl":
              prefix = ";"+prefix;
              //node.setAttribute("listprefix",prefix);
            break;
            default:
          }
        }
        node = node.parentNode;
      }
      return prefix;
    }

    function traverseEnumeration4Source(node,doc,prefix) {
      //prefix = prefix || "";
      traverseSource(node,function (node) {
        var prefix = calculatePrefix(node);
        //console.log("sceditor/formats/mediawiki.js:5658 - traversePrefix(node,'"+prefix+"') node.tagName='"+(node.tagName || "-") +"' ");
        //alert("sceditor/formats/mediawiki.js:5726 - traverseSource(node,'"+prefix+"') node.tagName='"+(node.tagName || "-") +"' node.innerHTML="+node.innerHTML);
        // find the mathjax editor links and replace them with a math-tag
        // the math-tag should contain the latex code that is stored in the
        // latex-attribute of the a-tag <a onclick="..." latex="....">...</a>
        if (node && node.tagName) {
          var tagName = node.tagName.toLowerCase();
          var parentTagName = "-";
          if (node.parentNode) {
            var pn = node.parentNode;
              if (pn.tagName) {
                parentTagName = pn.tagName.toLowerCase();
              };
          };
          switch (parentTagName) {
            case "dl":
              if (tagName == "dt") {
                // description title
                //prefix += ";";
                node.setAttribute("listprefix",prefix);
                console.log("sceditor/formats/mediawiki.js:5724 - traverseEnumeration4Source(node) <DL><DT>... node.outerHTML='"+node.outerHTML+"'")
              } else if (tagName == "dd") {
                // description data
                var tmpprefix = prefix.slice(0, -1);
                node.setAttribute("listprefix",tmpprefix + ":");
                console.log("sceditor/formats/mediawiki.js:5729 - traverseEnumeration4Source(node) <DL><DD>... node.outerHTML='"+node.outerHTML+"'")
              }
            break;
            case "ul":
              if (tagName == "li") {
                //prefix += "*";
                node.setAttribute("listprefix",prefix);
                console.log("sceditor/formats/mediawiki.js:5737 - traverseEnumeration4Source(node) <UL><LI>... node.outerHTML='"+node.outerHTML+"'")
                //alert("sceditor/formats/mediawiki.js:5737 - traverseEnumeration4Source(node) <UL><LI>... node.outerHTML='"+node.outerHTML+"'")
              }
            break;
            case "ol":
                if (tagName == "li") {
                  //prefix += "#";
                  node.setAttribute("listprefix",prefix);
                  console.log("sceditor/formats/mediawiki.js:5744 - traverseEnumeration4Source(node) <OL><LI>... node.outerHTML='"+node.outerHTML+"'")
                  //alert("sceditor/formats/mediawiki.js:5744 - traverseEnumeration4Source(node) <OL><LI>... node.outerHTML='"+node.outerHTML+"'")
                }
            break;
            default:
          }

        };
      });
    }

    function isChildAllowed4HTML(parent_name, child_name) {
			var	parentMediaWiki = {};
      var allowedChildren;
      if (parent_name) {
          parentMediaWiki = mediawikiHandlers[parent_name];
          if (parentMediaWiki) {
            allowedChildren = parentMediaWiki.allowedChildren;
          }
      };
      if (allowedChildren && allowedChildren.indexOf("*") >= 0) {
        // all children are allowed, if mediawikiHandler exists
        if ((child_name == "#") || mediawikiHandlers[child_name]) {
          console.log("sceditor/formats/mediawiki.js:2871 - isChildAllowed4HTML(parent='"+parent_name+"',child='"+child_name+"') ALL Children allowed");
  			  return true;
        }
      }
			if (base.opts.fixInvalidChildren && allowedChildren) {
        alert("sceditor/formats/mediawiki.js:2784 - isChildAllowed(parent='"+parent_name+"',child='"+child_name+"')");
        console.log("sceditor/formats/mediawiki.js:2784 - isChildAllowed4HTML(parent='"+parent_name+"',child='"+child_name+"')");
				return allowedChildren.indexOf(child_name || '#') > -1;
			}
			return true;
		}

    function sanitizeAllowedNodes4HTML(node,doc) {
      if (node && node.tagName && node.firstChild) {
        var child = node.firstChild;
        while (child) {
          //var next = child.nextSibling;
          var tn = child.tagName;
          if (tn && isChildAllowed4HTML(node.tagName,tn) == false) {
            console.log("sceditor/formats/mediawiki.js:6171 - Child <" + tn + "> of <" + node.tagName + "> is NOT allowed!");
            node.removeChild(child)
          }
          // node = next;
          child = child.nextSibling;
        }
      }
    }

    function preprocessSource(node,doc) {
      // traverseDOM(container,nodeHandler)
      console.log("sceditor/formats/mediawiki.js:6120 - BEFORE preprocessSource(node,doc) str='"+node.innerHTML+"'");
      traverseEnumeration4Source(node,doc);
      //alert("sceditor/formats/mediawiki.js:5754 - AFTER traverseEnumeration(node,doc) str='"+node.innerHTML+"'")
      console.log("sceditor/formats/mediawiki.js:5754 - AFTER traverseEnumeration(node,doc) str='"+node.innerHTML+"'")
      traverseMath4Source(node,doc);
      console.log("sceditor/formats/mediawiki.js:3936 - AFTER preprocessSource(node) str='"+node.innerHTML+"'");
      sanitizeAllowedNodes4HTML(node,doc);
    }


    function detokenizeMath4Source(text, data, options) {
      //console.log("Export Math to Text not implemented yet!");
      if (data.hasOwnProperty("mathexpr")) {
        for (var i = 0; i < data.mathexpr.length; i++) {
          var detok = data.mathexpr[i];
          if (detok.type=="block") {
            //text = replaceString(text,detok.label,"\n:<math display=\"block\" id=\""+get_unique_id("MATH")+"\">\n  "+detok.math+"\n</math>");
            //text = text.replace(detok.label,"<math display=\"block\" id=\""+get_unique_id("MATH")+"\">"+detok.math+"</math>");
            text = text.replace(detok.label,"<math display=\"block\">"+html2latex(detok.math) +"</math>");
          } else if (detok.type=="inline") {
            //text = replaceString(text,detok.label,"<math display=\"inline\" id=\""+get_unique_id("MATH")+"\">\n  "+detok.math+"\n</math>");
            //text = text.replace(detok.label,"<math display=\"inline\" id=\""+get_unique_id("MATH")+"\">"+detok.math+"</math>");
            text = text.replace(detok.label,"<math display=\"inline\">"+html2latex(detok.math)+"</math>");
          }
        }
      }
      return text
    }

		/**
		 * Converts HTML into MediaWiki
		 *
		 * @param {boolean} asFragment
		 * @param {string}	html
		 * @param {!Document} [context]
		 * @param {!HTMLElement} [parent]
		 * @return {string}
		 * @private
		 */
    function toSource(asFragment, html, context, parent, doc) {
      doc = extend_default_doc(doc);
      if (html) {
        //html =  preprocess(html,doc,"source");
        console.log("sceditor/formats/mediawiki.js:5793 - CALL: toSource(asFragment,html,context,parent) html='"+html+"'");
      }
      //source = tokenizeMath4Source(source,doc);
      var source = toSOURCE(asFragment, html, context, parent, doc);
      source = detokenizeMath4Source(source,doc);
      //if (source) alert("sceditor/formats/mediawiki.js:6401 - source="+source)
      //if (source) alert("sceditor/formats/mediawiki.js:6402 - doc="+JSON.stringify(doc,null,4));
      return source;
    };

    function toSOURCE(asFragment, html, context, parent, doc) {
			context = context || document;

			var	mediawiki, elements;
			var containerParent = context.createElement('div');
			var container = context.createElement('div');
			var parser = new MediaWikiParser(base.opts.parserOptions);

			container.innerHTML = html;
      preprocessSource(container,doc);
			css(containerParent, 'visibility', 'hidden');
			containerParent.appendChild(container);
			context.body.appendChild(containerParent);
      //alert("sceditor/formats/mediawiki.js:5813 - AFTER preprocessSource(container,doc) container.innerHTML='"+container.innerHTML+"'")

			if (asFragment) {
				// Add text before and after so removeWhiteSpace doesn't remove
				// leading and trailing whitespace
				containerParent.insertBefore(
					context.createTextNode('#'),
					containerParent.firstChild
				);
				containerParent.appendChild(context.createTextNode('#'));
			}

			// Match parents white-space handling
			if (parent) {
				css(container, 'whiteSpace', css(parent, 'whiteSpace'));
			}

			// Remove all nodes with sceditor-ignore class
			elements = container.getElementsByClassName('sceditor-ignore');
			while (elements.length) {
				elements[0].parentNode.removeChild(elements[0]);
			}

			dom.removeWhiteSpace(containerParent);

			mediawiki = elementToMediawiki(container);
      //console.log("sceditor/formats/mediawiki.js:5871 - AFTER elementToMediawiki()-Call - mediawiki='"+mediawiki+"'")

			context.body.removeChild(containerParent);
      // EN - do not parse generated "mediawiki"
			//mediawiki = parser.toMediaWikiCode(mediawiki, true);

			if (base.opts.mediawikiTrim) {
				mediawiki = mediawiki.trim();
			}

			return mediawiki;
		};

    base.replaceSections = replaceSections;
    base.toTree = toTree.bind(null);
    var asFragment = false;
		base.toHtml = toHtml.bind(null, asFragment);
    asFragment = true;
		base.fragmentToHtml = toHtml.bind(null, asFragment);
		asFragment = false;
    base.toSource = toSource.bind(null, asFragment);
    asFragment = true;
		base.fragmentToSource = toSource.bind(null, asFragment);
    //base.tokenizeMath4Source = tokenizeMath4Source.bind(null, true);
    base.detokenizeMath4Source = detokenizeMath4Source.bind(null, true);
	};
  /*
  mediawikiFormat.toHTML = function (source) {
    var asFragment = false;
    return toHtml(asFragment, source);
  };
  mediawikiFormat.toHtml = mediawikiFormat.toHTML;

  mediawikiFormat.toSOURCE = function (html) {
    var asFragment = false;
    return toSOURCE(asFragment, html);
  };
  mediawikiFormat.toSource = mediawikiFormat.toSOURCE;
  */
	/**
	 * Gets a MediaWiki
	 *
	 * @param {string} name
	 * @return {Object|null}
	 * @since 2.0.0
	 */
	mediawikiFormat.get = function (name) {
		return mediawikiHandlers[name] || null;
	};


	/**
	 * Adds a MediaWiki to the parser or updates an existing
	 * MediaWiki if a MediaWiki with the specified name already exists.
	 *
	 * @param {string} name
	 * @param {Object} mediawiki
	 * @return {this}
	 * @since 2.0.0
	 */
	mediawikiFormat.set = function (name, mediawiki) {
		if (name && mediawiki) {
			// merge any existing command properties
			mediawiki = extend(mediawikiHandlers[name] || {}, mediawiki);

			mediawiki.remove = function () {
        // if clause added by EN
        if (mediawikiHandlers.hasOwnProperty(name)) {
          delete mediawikiHandlers[name];
        }
			};

			mediawikiHandlers[name] = mediawiki;
		}

		return this;
	};

	/**
	 * Renames a MediaWiki
	 *
	 * This does not change the format or HTML handling, those must be
	 * changed manually.
	 *
	 * @param  {string} name    [description]
	 * @param  {string} newName [description]
	 * @return {this|false}
	 * @since 2.0.0
	 */
	mediawikiFormat.rename = function (name, newName) {
		if (name in mediawikiHandlers) {
			mediawikiHandlers[newName] = mediawikiHandlers[name];

			delete mediawikiHandlers[name];
		}

		return this;
	};

	/**
	 * Removes a MediaWiki
	 *
	 * @param {string} name
	 * @return {this}
	 * @since 2.0.0
	 */
	mediawikiFormat.remove = function (name) {
		if (name in mediawikiHandlers) {
			delete mediawikiHandlers[name];
		}

		return this;
	};



	mediawikiFormat.formatMediaWikiString = formatMediaWikiString;
  mediawikiFormat["name4format"] = "mediawiki";
  //mediawikiFormat.getDisplayURL = getWikiDisplayURL;

	sceditor.formats.mediawiki = mediawikiFormat;

	sceditor.MediaWikiParser = MediaWikiParser;
}(sceditor));
