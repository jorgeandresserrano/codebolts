// Arrows
// http://dbp-consulting.com/tutorials/canvas/CanvasArrow.html

function drawArrow (ctx,x1,y1,x2,y2,style,which,angle,d)
{
  'use strict';
 
  // default to using drawHead to draw the head, but if the style argument is a function, use it instead
  var toDrawHead = drawHead; // a function

  // For ends with arrow we actually want to stop before we get to the arrow so that wide lines won't put a flat end on the arrow.
  var dist = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
  var ratio = (dist-d/3)/dist;
  var tox, toy, fromx, fromy;
  
  if(which&1){
    tox=Math.round(x1+(x2-x1)*ratio)+0.5;
    toy=Math.round(y1+(y2-y1)*ratio)+0.5;
  }else{
    tox=Math.round(x2)+0.5;
    toy=Math.round(y2)+0.5;
  }
  if(which&2){
    fromx=Math.round(x1+(x2-x1)*(1-ratio))+0.5;
    fromy=Math.round(y1+(y2-y1)*(1-ratio))+0.5;
  }else{
    fromx=Math.round(x1)+0.5;
    fromy=Math.round(y1)+0.5;
  }

  // Draw the shaft of the arrow
  ctx.beginPath();
  ctx.moveTo(fromx,fromy);
  ctx.lineTo(tox,toy);
  ctx.lineWidth = 1;
  ctx.stroke();

  // calculate the angle of the line
  var lineangle=Math.atan2(y2-y1,x2-x1);
  // h is the line length of a side of the arrow head
  var h=Math.abs(d/Math.cos(angle));

  if(which&1){	// handle far end arrow head
    var angle1=lineangle+Math.PI+angle;
    var topx=x2+Math.cos(angle1)*h;
    var topy=y2+Math.sin(angle1)*h;
    var angle2=lineangle+Math.PI-angle;
    var botx=x2+Math.cos(angle2)*h;
    var boty=y2+Math.sin(angle2)*h;
    toDrawHead(ctx,topx,topy,x2,y2,botx,boty,style);
  }
  if(which&2){ // handle near end arrow head
    var angle1=lineangle+angle;
    var topx=x1+Math.cos(angle1)*h;
    var topy=y1+Math.sin(angle1)*h;
    var angle2=lineangle-angle;
    var botx=x1+Math.cos(angle2)*h;
    var boty=y1+Math.sin(angle2)*h;
    toDrawHead(ctx,topx,topy,x1,y1,botx,boty,style);
  }
}

var drawHead=function(ctx,x0,y0,x1,y1,x2,y2,style)
{
  'use strict';
  if(typeof(x0)=='string') x0=parseFloat(x0);
  if(typeof(y0)=='string') y0=parseFloat(y0);
  if(typeof(x1)=='string') x1=parseFloat(x1);
  if(typeof(y1)=='string') y1=parseFloat(y1);
  if(typeof(x2)=='string') x2=parseFloat(x2);
  if(typeof(y2)=='string') y2=parseFloat(y2);
  var radius=3;
  var twoPI=2*Math.PI;
  
  // round + 0.5, for blurry appearence
  x0 = Math.round(x0) + 0.5;
  x1 = Math.round(x1) + 0.5;
  x2 = Math.round(x2) + 0.5;
  y0 = Math.round(y0) + 0.5;
  y1 = Math.round(y1) + 0.5;
  y2 = Math.round(y2) + 0.5;

  // all cases do this.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x2,y2);
  
  switch(style){
    case 0:
      // curved filled, add the bottom as an arcTo curve and fill
      var backdist=Math.sqrt(((x2-x0)*(x2-x0))+((y2-y0)*(y2-y0)));
      ctx.arcTo(x1,y1,x0,y0,.55*backdist);
      ctx.fill();
      break;
    case 1:
      // straight filled, add the bottom as a line and fill.
      ctx.beginPath();
      ctx.moveTo(x0,y0);
      ctx.lineTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.lineTo(x0,y0);
      ctx.fill();
      break;
    case 2:
      // unfilled head, just stroke.
      ctx.stroke();
      break;
    case 3:
      //filled head, add the bottom as a quadraticCurveTo curve and fill
      var cpx=(x0+x1+x2)/3;
      var cpy=(y0+y1+y2)/3;
      ctx.quadraticCurveTo(cpx,cpy,x0,y0);
      ctx.fill();
      break;
    case 4:
      //filled head, add the bottom as a bezierCurveTo curve and fill
      var cp1x, cp1y, cp2x, cp2y,backdist;
      var shiftamt=5;
      if(x2==x0){
		// Avoid a divide by zero if x2==x0
		backdist=y2-y0;
		cp1x=(x1+x0)/2;
		cp2x=(x1+x0)/2;
		cp1y=y1+backdist/shiftamt;
		cp2y=y1-backdist/shiftamt;
		  }else{
		backdist=Math.sqrt(((x2-x0)*(x2-x0))+((y2-y0)*(y2-y0)));
		var xback=(x0+x2)/2;
		var yback=(y0+y2)/2;
		var xmid=(xback+x1)/2;
		var ymid=(yback+y1)/2;

		var m=(y2-y0)/(x2-x0);
		var dx=(backdist/(2*Math.sqrt(m*m+1)))/shiftamt;
		var dy=m*dx;
		cp1x=xmid-dx;
		cp1y=ymid-dy;
		cp2x=xmid+dx;
		cp2y=ymid+dy;
		  }

      ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x0,y0);
      ctx.fill();
      break;
  }
  ctx.restore();
};