var utils = require('../utils')
  , nodes = require('../nodes');

/**
 * Return the current selector or compile
 * selector from a string or a list.
 *
 * @param {String|Expression}
 * @return {String}
 * @api public
 */

(module.exports = function selector(){
  var stack = this.selectorStack
    , args = [].slice.call(arguments);

  if (1 == args.length) {
    var expr = utils.unwrap(args[0])
      , len = expr.nodes.length
      , sel = expr.first;

    // selector('.a')
    if (1 == len && 'string' == sel.nodeName) {
      var SelectorParser = require('../selector-parser')
        , parsed = new SelectorParser(sel.val).parse().val;

      if (parsed == sel.val) return sel.val;

      stack.push(parse(sel.val));
    } else if (len > 1) {
      // selector-list = '.a', '.b', '.c'
      // selector(selector-list)
      if (expr.isList) {
        pushToStack(expr.nodes, stack);
      // selector('.a' '.b' '.c')
      } else {
        stack.push(parse(expr.nodes.map(function(node){
          return node.val;
        }).join(' ')));
      }
    }
  // selector('.a', '.b', '.c')
  } else if (args.length > 1) {
    pushToStack(args, stack);
  }

  return stack.length
    ? utils.compileSelectors(stack).join(',') || nodes.null
    : '&';
}).raw = true;

function pushToStack(selectors, stack) {
  selectors.forEach(function(sel) {
    stack.push(parse(sel.first.val));
  });
}

function parse(selector) {
  var Parser = new require('../parser')
    , parser = new Parser(selector)
    , nodes;
  parser.state.push('selector-parts');
  nodes = parser.selector();
  nodes.forEach(function(node) {
    node.val = node.segments.join('');
  });
  return nodes;
}
