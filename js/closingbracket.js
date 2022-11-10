/* ---------------------------------------
 Exported Module Variable: BracketHandler
 Package:  closingbracket
 Version:  1.0.10  Date: 2021/04/03 14:47:44
 Homepage: https://github.com/niebert/closingbracket#readme
 Author:   Engelbert Niehaus
 License:  MIT
 Date:     2021/04/03 14:47:44
 Require Module with:
    const BracketHandler = require('closingbracket');
 JSHint: installation with 'npm install jshint -g'
 ------------------------------------------ */
/*jshint  laxcomma: true, asi: true, maxerr: 150 */
/*global alert, confirm, console, prompt */
function find_closing_bracket(expression,closebracket,startsearch_at){
    var openbracket = "-";
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
          // undefined bracket
          openbracket = "-";
    }
    if (openbracket != "-") {
      var index = startsearch_at;
      // check character at index if it is already
      // the opening bracket.
      while ((index < expression.length) && (expression.charAt(index)!=openbracket)) {
        index++;
      }
      if (index < expression.length) {
        vResult.openbracket_at = index;
        //console.log("Opening Bracket '" + openbracket+ "' found at position "+index);
        var bracket_stack = [];
        // Traverse through string starting from
        // given index.
        while (index < expression.length){

            if (expression.charAt(index) == openbracket) {
              // If current character is an
              // opening bracket push it in stack.
              // that is performed for the first bracket as well.
              bracket_stack.push(expression.charAt(index));
            } else {
              // If current character is a closing
              // bracket, remove one opening bracket
              // from the bracket stack - i.e. pop from stack.
              // If bracket stack is empty, then this closing
              // bracket is the corresponding bracket for the
              // first bracket pushed.
              if (expression.charAt(index) == closebracket) {
                bracket_stack.pop();
                if (bracket_stack.length == 0) {
                  //console.log("Closing Bracket '" + closebracket+ "' found at position "+index);
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
/*
var str = "MyCheck(asdas(iasd)asdas asd) ashdj(sakdjk))";
console.log("String: '" + str +  "'");
var vResult = find_closing_bracket(str,")",2);
console.log("Result: "+JSON.stringify(vResult,null,4));
console.log("Open Char At " + vResult.openbracket_at + ": '" + str.charAt(vResult.openbracket_at) + "'");
console.log("Close Char At " + vResult.closebracket_at + ": '" + str.charAt(vResult.closebracket_at) + "'");
*/

function find_parameter_of_function(expression,fct,fctpos) {
  var index = (startsearch_at || 0);
  var vResult = {
    "start_search": 0,
    "openbracket_at": -1,
    "closebracket_at": -1
  };
  var params4fct = "-"; // undefined;
  if (expression) {
    var pos = fctpos || expression.indexOf(fct+"(");
    if (pos >= 0) {
      // command is found
      params4fct = fct;
      vReturn = find_closing_bracket(expression,")",pos);
      if (vReturn.openbracket_at >= 0) {
        if (vReturn.closebracket_at >= 0) {
          params4fct = expression.substring(vReturn.openbracket_at+1,vReturn.closebracket_at);
          console.log("parameter '"+params4fct+"' of function found fct='" + fct + "'");
        }
      }
    }
  }
  //console.log("expression 3='"+expression+"'");
  if (params4fct == "-") {
    console.error("CALL: find_command_name() - command name not found");
  }
  return params4fct;
}


function find_command_name(expression,startsearch_at) {
  var index = (startsearch_at || 0);
  var cmd_name = "-"; // undefined;
  var vReturn = find_closing_bracket(expression,"}",1);
  /* undefined results for
  var vResult = {
    "start_search": 0,
    "openbracket_at": -1,
    "closebracket_at": -1
  };
  */
  //console.log("expression 3='"+expression+"'");
  if (vReturn.openbracket_at >= 0) {
    if (vReturn.closebracket_at >= 0) {
      cmd_name = expression.substring(vReturn.openbracket_at+1,vReturn.closebracket_at);
      console.log("newcommand found var='" + cmd_name + "'");
    }
  }
  if (cmd_name == "-") {
    console.error("CALL: find_command_name() - command name not found");
  }
  return cmd_name;
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


function parse_newcommands(expression,index) {
  var vNewCommands = [];
  index = index || 0;
  expression = expression.substr(index);
  while (expression.indexOf("\\newcommand{")>=0) {
    var cmd = {
      "name": "",
      "definition":"undefined latex newcommand",
      "params":0
    };
    var vReturn = null;
    //console.log("expression 1='"+expression+"'");
    index = expression.indexOf("\\newcommand{");
    expression = expression.substr(index);
    //console.log("expression 3='"+expression+"'");
    var cmd_name = find_command_name(expression,0);
    if (cmd_name != "-") {
      cmd.name = cmd_name;
      // 12 = length "\newcommand{"
      // cmd_name.length = 6 for cmd_name="\mycmd"
      // \newcommand{\mycmd}[3]
      var m = 12 + cmd_name.length + 3;
      // Check for Parameter Count Definition e.g. "[3]"
      if (expression.indexOf("[") <= m) {
        vReturn = find_closing_bracket(expression,"]",12 + cmd_name.length);
        /* undefined results for
        var vResult = {
          "start_search": 0,
          "openbracket_at": -1,
          "closebracket_at": -1
        };
        */
        var param_count = 0;
        if (vReturn.openbracket_at >= 0) {
          if (vReturn.closebracket_at >= 1) {
            param_count = parseInt(expression.substring(vReturn.openbracket_at+1,vReturn.closebracket_at));
            console.log("Command '" + cmd.name + "' has " + param_count + " parameter - open="+vReturn.openbracket_at+" close="+vReturn.closebracket_at);
          }
        }
        //console.log("Command: '" + cmd_name + "' has "+ param_count+" parameters");
        cmd.params = param_count;
        expression = expression.substr(expression.indexOf("}")+1);
        //console.log("expression before definition parsing='"+expression+"'");
        vReturn = find_closing_bracket(expression,"}",0);
        if (vReturn.openbracket_at >= 0) {
          if (vReturn.closebracket_at >= 1) {
            cmd.definition =  expression.substring(vReturn.openbracket_at+1,vReturn.closebracket_at);
            //console.log("Definition found for newcommand='" + cmd_name + "' with definition\n'" + cmd.definition + "'");
            expression = expression.substr(cmd.definition.length + expression.indexOf("]") + 3);
            //console.log("expression after definition found='"+expression+"'");
          }
        }
      } else {
        // newcommand definition without a parameter brackets "[3]"
        expression = expression.substr(expression.indexOf("}")+1);
        vReturn = find_closing_bracket(expression,"}",0);
        if (vReturn.openbracket_at >= 0) {
          if (vReturn.closebracket_at >= 1) {
            cmd.definition =  expression.substring(vReturn.openbracket_at+1,vReturn.closebracket_at);
            //console.log("Definition found for newcommand='" + cmd_name + "' with definition\n'" + cmd.definition + "'");
            expression = expression.substr(cmd.definition.length + 3);
            //console.log("expression after definition found='"+expression+"'");
          }
        }
        //if (expression.indexOf("{") <= m) {
        //}
      }
      vNewCommands.push(cmd);
    } else {
      console.error("Command Name not found!");
      break;
    }
  }
  return vNewCommands;
}

function extract_parameter(expression,count,index) {
  var vResult = {
      "params":[],
      "end_at": 0
  };
  // push all parameters to the array e.g.
  // \mycmd{first}{second par}{third}
  // vParam = ["first","second par","third"]
  var p=0;
  while (p < count) {
    vReturn = find_closing_bracket(expression,"}",index);
    if (vReturn.openbracket_at >= 0) {
      if (vReturn.closebracket_at >= 0) {
        var param = expression.substring(vReturn.openbracket_at+1,vReturn.closebracket_at);
        vResult.params.push(param);
        index = vReturn.closebracket_at + 1;
        console.log("Parameter "+(p+1)+" found '" + param + "'");
      }
      // set the end of the parameter as end
      vResult.end_at = index;
    } else {
      console.error("Parameter "+(p+1)+" could not be parsed!");
    }
    p++;
  }
  return vResult;
}

function replace_cmd_definition(cmd,params) {
  // \mycmd{FIRST}{SECOND}
  // vParam = ["FIRST","SECOND"]
  /*
  cmd = {
    "name": "\mycmd",
    "definition":"defined text #1 with two #2 parameters in latex definition",
    "params":2
  };
  def4replace="defined text FIRST with two SECOND parameters in latex definition"
  */
  var def4replace = cmd.definition;
  for (var i = 0; i < params.length; i++) {
    def4replace = replaceString(def4replace,"#"+(i+1),params[i]);
  }
  return def4replace;
}

function expand_newcommand(expression,cmd,found) {
  var index = found;
  // \mycmd{asdasd}{asdasd}{asdas}
  /*
  cmd = {
    "name": "\mycmd",
    "definition":"defined text #1 with two #2 parameters in latex definition",
    "params":2
  };
  */
  console.log("Command '" + cmd.name + "' has "+cmd.params+" parameter.");
  if (cmd.params == 0) {
    console.log("[0] Command '" + cmd.name + "' has "+cmd.params+" parameter.");
    expression = replaceString(expression,cmd.name,cmd.definition);
  } else {
      console.log("[" + cmd.params + "] Command '" + cmd.name + "' has "+cmd.params+" parameter.");
      var vResult = extract_parameter(expression,cmd.params,found);
      var def4replace = replace_cmd_definition(cmd,vResult.params);
      var search = expression.substring(found,vResult.end_at);
      expression = replaceString(expression,search,def4replace);
  }
  return expression;
}

function replace_count_newcommands(expression,pNewCommands) {
  var count = 0;
  for (var i = 0; i < pNewCommands.length; i++) {
      var cmd = pNewCommands[i];
      //console.log("replace_count_newcommands('" + cmd.name + "')");
      var search = cmd.name + "{";
      var vFound = expression.indexOf(search);
      while (vFound >= 0) {
        count++;
        expression = expand_newcommand(expression,cmd,vFound);
        // check if the expression contains more uses of the command cmd
        vFound = expression.indexOf(search);
      }
      search = cmd.name + " ";
      vFound = expression.indexOf(search);
      while (vFound >= 0) {
        count++;
        expression = expand_newcommand(expression,cmd,vFound);
        // check if the expression contains more uses of the command cmd
        vFound = expression.indexOf(search);
      }
      search = cmd.name + "$";
      vFound = expression.indexOf(search);
      while (vFound >= 0) {
        count++;
        expression = expand_newcommand(expression,cmd,vFound);
        // check if the expression contains more uses of the command cmd
        vFound = expression.indexOf(search);
      }
      search = cmd.name + "(";
      vFound = expression.indexOf(search);
      while (vFound >= 0) {
        count++;
        expression = expand_newcommand(expression,cmd,vFound);
        // check if the expression contains more uses of the command cmd
        vFound = expression.indexOf(search);
      }
  }
  console.log("CALL: replace_count_newcommands() - replacements count="+count);
  return  {
    "expression":expression,
    "count":count
  };
}

function replace_newcommands(expression,pNewCommands,pmax_recursion) {
  var max_recursion = pmax_recursion || 5;
  // macros may also contain other LaTeX commands.
  // so replacement of the macro in first recursion
  // needs further replacements of the replaced macros in
  // the newcommand definition.
  var recursions = 0;
  // recursions count the number of recursions the are already performed
  // max_recursion defines the number of maximal recursions
  // that will be performed by the newcommand replacements,
  // the parameter can be set by the function parameters.
  // if not set the default recursion depth is 5.
  // max_recursion is safety mechanism for the function.
  // so that it terminates even if there is a cycle newcommand replacment.
  // e.g. command "cmd1" uses "cmd2" in the definition and
  // "cmd2" uses "cmd1" in its definition.
  if (pNewCommands) {
    while (recursions < max_recursion) {
      recursions++;
      console.log("replace_newcommands() recursion [" +recursions + "]");
      var vResult = replace_count_newcommands(expression,pNewCommands);
      if (vResult.count == 0) {
        recursions = max_recursion
      } else {
        expression = vResult.expression;
      }
    }
  } else {
    console.error("ERROR: pNewCommands not defined for replacing commands");
  }
  return expression;
}



var latex = "Beispiel: \n  \\newcommand{\\mycmd}[3]{Gleichung (\\ref{#1}) $\\frac{#2}{#3}$ Ende} bewirkt\n bei Einsatz in \\mycmd{Nr1}{Bla}{Blub} die Ausgabe";
latex +=  "\\newcommand{\\secondcmd}[4]{Gleichung {hjsd{}{}} enge} askjdkasld \\noparamdef ladslkl";
latex +=  "\n \\newcommand{\\noparamdef}{Definition as a no parameter {New{C}{om}}mand } askjdkasld";
latex = "Beispiel: \\newcommand{\\mycmd}[3]{Gleichung (\\ref{#1}) $\\frac{#2}{#3}$ Ende} bewirkt\n bei Einsatz in \\mycmd{Nr1}{Bla}{Blub} die Ausgabe \\mycmd{FIRST}{SECOND}{THIRD} XXXX";
latex = `
\\newcommand{\\tool}[2]{Title #1: The #1 is used for #2}
\\newcommand{\\cmd}[3]{\\int_{#1}^{#2} f(#3) d#3}

\\tool{hammer}{nails}
\\tool{hammer}{nails}
\\tool{hammer}{nails}
Mathematical expressions are
$\\cmd{4}{5}{x}$ and $\\cmd{a}{b}{y}$
`;
latex = `
\\newcommand{\\tool}[2]{\\tooltitle{#1} The #1 is used for #2}
\\newcommand{\\tooltitle}[1]{Title #1: }

\\tool{hammer}{nails}
`;

var vNewCommands = parse_newcommands(latex);
console.log("JSON: "+ JSON.stringify(vNewCommands,null,4));
var expression = replace_newcommands(latex,vNewCommands);
console.log("-------------------------------------");
console.log("Source: '" + latex + "'");
console.log("-------------------------------------");
console.log("Result: '" + expression + "'");
console.log("-------------------------------------");

function clone_json(a) {
  var c = JSON.parse(JSON.stringify(a));
  return c;
}

function concat_array (a,b) {
  var c = clone_json(a);
  var bc = clone_json(b);
  for (var j = 0; j < bc.length; j++) {
    c.push(bc[j]);
  }
  return c;
}

var BracketHandler = {
  "find_closing_bracket": find_closing_bracket,
  "parse_newcommands": parse_newcommands,
  "replace_newcommands": replace_newcommands,
  "concat_array":concat_array,
  "clone_json": clone_json
};
