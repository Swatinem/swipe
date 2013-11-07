
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var events = require('events');

/**
 * Expose `Swipe`.
 */

module.exports = Swipe;

/**
 * Swipe
 *
 * @param {Element} el
 * @api public
 */

function Swipe(el) {
  if (!(this instanceof Swipe)) return new Swipe(el);
  if (!el) throw new TypeError('Swipe() requires an element');
  this.el = el;
  this.move = null;
  this.threshold(5);
  this.bind();
}

/**
 * Mixin `Emitter`.
 */

Emitter(Swipe.prototype);

/**
 * Bind event handlers.
 *
 * @api public
 */

Swipe.prototype.bind = function(){
  this.events = events(this.el, this);
  this.events.bind('mousedown', 'ontouchstart');
  this.events.bind('touchstart');

  this.docEvents = events(document, this);
};

/**
 * Unbind event handlers.
 *
 * @api public
 */

Swipe.prototype.unbind = function(){
  this.events.unbind();
  this.docEvents.unbind();
};


Swipe.prototype.threshold = function(n){
  this._threshold = n;
};

/**
 * ontouchstart
 * Handle touchstart.
 *
 * @api private
 */

Swipe.prototype.ontouchstart = function (e){
  e.stopPropagation();
  e.preventDefault();
  if (e.touches) {
    e = e.touches[0];
  }
  this.move = {
    start_x: e.pageX,
    start_y: e.pageY,
    start_t: new Date,
    dx: 0,
    dy: 0,
    dt: 0
  };

  this.docEvents.bind('mousemove', 'ontouchmove');
  this.docEvents.bind('touchmove');
  this.docEvents.bind('mouseup', 'ontouchend');
  this.docEvents.bind('touchend');

  this.emit('swipestart', this.move);
};

/**
 * ontouchmove
 * Handle touchmove.
 *
 * @param {MouseEvent|TouchEvent} e event
 * @api private
 */

Swipe.prototype.ontouchmove = function (e) {
  if (!this.move) {
    return;
  }
  if (e.touches && e.touches.length > 1) {
    return;
  }
  e.stopPropagation();
  e.preventDefault();
  if (e.touches) {
    e = e.touches[0];
  }
  var move = this.move;
  move.x = e.pageX;
  move.y = e.pageY;
  move.dx = move.x - move.start_x;
  move.dy = move.y - move.start_y;
  this.emit('move', move);
};

/**
 * ontouchend
 * Handle touchend.
 *
 * @param {MouseEvent|TouchEvent} e event
 * @api private
 */

Swipe.prototype.ontouchend = function(e){
  if (!this.move) {
    return;
  }
  e.stopPropagation();
  if (e.changedTouches) {
    e = e.changedTouches[0];
  }

  var move = this.move;
  this.move = null;

  move.x = e.pageX;
  move.y = e.pageY;
  move.t = new Date;
  move.dx = move.x - move.start_x;
  move.dy = move.y - move.start_y;
  move.dt = move.t - move.start_t;

  this.docEvents.unbind();

  this.emit('swipeend', move);

  if (Math.abs(move.dx) > this._threshold)
    this.emit(move.dx < 0 'swipeleft' : 'swiperight', move);

  if (Math.abs(move.dy) > this._threshold)
    this.emit(move.dy < 0 'swipeup' : 'swipedown', move);
};
