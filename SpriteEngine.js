/**
 * @author Richard Butterworth Digital Media Design
 * 
 * Version 0.2.1
 * 
 * Sprite Engine is a set of classes to facilitate a simple ActionScript-like stage
 * on an HTML5 canvas containing a set of sprites that can be event driven.
 * 
 * It was developed as a teaching aid for INM355 Multimedia Design and Development taught
 * at City University, London. UK.
 * 
 */

/**
 * Class: SpriteEvent encapsulates a basic set of information about an event that occurs
 * to a sprite.
 */

function SpriteEvent( x, y, src, e )
{
	this.x = x;
	this.y = y;
	this.src = src;
	this.timestamp = new Date( );
	this.event = e;
}

/**
 * Class: SpriteEngineEvent encapsulates a basic set of information about an event that
 * occurs to a sprite engine.
 */

function SpriteEngineEvent( src, e, keycode )
{
	this.src = src;
	this.timestamp = new Date( );
	this.event = e;
	this.keycode = keycode;
}

/**
 * Class: SpriteEngine holds the display list of Sprites to be displayed on the canvas. It has
 * methods for adding, removing and reordering the display list of Sprites, drawing the display
 * list, allowing sprites to be dragged, and also captures mouse and keyboard events and passes them
 * to the sprites in the display list.
 */

function SpriteEngine( canvaselementname )
{
	this.canvaselement = document.getElementById( canvaselementname );
	this.context = this.canvaselement.getContext( "2d" );
	this.sprites = new Array( );
	
	this.mouseover = false;
	this.mousex = 0;
	this.mousey = 0;
	var deviceAgent = navigator.userAgent.toLowerCase();
	this.ios = deviceAgent.match(/(iphone|ipod|ipad)/);

	this.draggedsprite = null;
	this.keypresses = new Array( );
	this.toloads = new Array( );
	
	this.listeners = new Array( );
	
	var spriteengine = this;
	
	document.addEventListener( "mousemove", mouseMove, false );
	this.canvaselement.addEventListener( "click", mouseClick, false );
	this.canvaselement.addEventListener( "mouseup", mouseUp, false );
	this.canvaselement.addEventListener( "mousedown", mouseDown, false );
	document.addEventListener( "keydown", doKeyDown, false );
	document.addEventListener( "keyup", doKeyUp, false );
	
	function mouseMove( e )
	{
		var oldmouseover = spriteengine.mouseover;
		var mousexraw = 0;
		var mouseyraw = 0;
		if ( !e ) var e = window.event;
		if ( e.pageX || e.pageY )
		{
			mousexraw = e.pageX;
			mouseyraw = e.pageY;
		}
		else if ( e.clientX || e.clientY )
		{
			mousexraw = e.clientX + document.body.scrollLeft
				+ document.documentElement.scrollLeft;
			mouseyraw = e.clientY + document.body.scrollTop
				+ document.documentElement.scrollTop;
		}
		var pos = getElementPos( spriteengine.canvaselement );
		if( pos[ 1 ] <= mouseyraw &&
			mouseyraw <= pos[ 1 ] + spriteengine.canvaselement.offsetHeight &&
			pos[ 0 ] <= mousexraw &&
			mousexraw <= pos[ 0 ] + spriteengine.canvaselement.offsetWidth )
		{
			spriteengine.mouseover = true;
			spriteengine.mousex = Math.floor( mousexraw - pos[ 0 ] );
			spriteengine.mousey = Math.floor( mouseyraw - pos[ 1 ] );
		}		
		else
		{
			spriteengine.mouseover = false;
		}
		if( spriteengine.mouseover != oldmouseover )
		{
			for( var l in spriteengine.listeners )
			{
				if( spriteengine.listeners[ l ][ 0 ] == "mousein" && spriteengine.mouseover )
				{
					spriteengine.listeners[ l ][ 1 ]( new SpriteEngineEvent( spriteengine, "mousein" ) );
				}
				else if( spriteengine.listeners[ l ][ 0 ] == "mouseout" && !spriteengine.mouseover )
				{
					spriteengine.listeners[ l ][ 1 ]( new SpriteEngineEvent( spriteengine, "mouseout" ) );
				}
			}
		}
	}
	
	function getElementPos( el )
	{
		var left = 0;
		var top = 0;
		do
		{
			left += el.offsetLeft;
			top += el.offsetTop;
		}
		while( el = el.offsetParent );
		return [ left, top ];
	}
	
	function mouseClick( e )
	{
		for( var l in spriteengine.listeners )
		{
			if( spriteengine.listeners[ l ][ 0 ] == "click" )
			{
				spriteengine.listeners[ l ][ 1 ]( new SpriteEngineEvent( spriteengine, "click" ) );
			}
		}
		for( var s in spriteengine.sprites )
		{
			if( spriteengine.sprites[ s ].pointHitTest( spriteengine.mousex, spriteengine.mousey ) &&
				spriteengine.sprites[ s ].visible )
			{
				for( var l in spriteengine.sprites[ s ].listeners )
				{
					if( spriteengine.sprites[ s ].listeners[ l ][ 0 ] == "click" )
					{
						spriteengine.sprites[ s ].listeners[ l ][ 1 ]
								( new SpriteEvent( spriteengine.mousex, spriteengine.mousey, spriteengine.sprites[ s ], "click" ) );
						
					}
				}
				if( spriteengine.sprites[ s ].type == "button" )
				{
					spriteengine.sprites[ s ].recoil = spriteengine.sprites[ s ].pressoffset;
				}
			}
		}
	}
	
	function mouseUp( e )
	{
		for( var l in spriteengine.listeners )
		{
			if( spriteengine.listeners[ l ][ 0 ] == "mouseup" )
			{
				spriteengine.listeners[ l ][ 1 ]( new SpriteEngineEvent( spriteengine, "mouseup" ) );
			}
		}
		for( var s in spriteengine.sprites )
		{
			if( spriteengine.sprites[ s ].pointHitTest( spriteengine.mousex, spriteengine.mousey ) &&
			 	spriteengine.sprites[ s ].visible )
			{
				for( var l in spriteengine.sprites[ s ].listeners )
				{
					if( spriteengine.sprites[ s ].listeners[ l ][ 0 ] == "mouseup" )
					{
						spriteengine.sprites[ s ].listeners[ l ][ 1 ]
								( new SpriteEvent( spriteengine.mousex, spriteengine.mousey, spriteengine.sprites[ s ], "mouseup" ) );
						
					}
				}
			}
		}
	}
	
	function mouseDown( e )
	{
		for( var l in spriteengine.listeners )
		{
			if( spriteengine.listeners[ l ][ 0 ] == "mousedown" )
			{
				spriteengine.listeners[ l ][ 1 ]( new SpriteEngineEvent( spriteengine, "mousedown" ) );
			}
		}
		for( var s in spriteengine.sprites )
		{
			if( spriteengine.sprites[ s ].pointHitTest( spriteengine.mousex, spriteengine.mousey ) &&
				spriteengine.sprites[ s ].visible )
			{
				for( var l in spriteengine.sprites[ s ].listeners )
				{
					if( spriteengine.sprites[ s ].listeners[ l ][ 0 ] == "mousedown" )
					{
						spriteengine.sprites[ s ].listeners[ l ][ 1 ]
								( new SpriteEvent( spriteengine.mousex, spriteengine.mousey, spriteengine.sprites[ s ], "mousedown" ) );
						
					}
				}
			}
		}
	}
	
	function doKeyDown( e )
	{
		e = e ? e : window.event;
		spriteengine.keypresses[ e.keyCode ] = true;
		for( var l in spriteengine.listeners )
		{
			if( spriteengine.listeners[ l ][ 0 ] == "keydown" )
			{
				spriteengine.listeners[ l ][ 1 ]( new SpriteEngineEvent( spriteengine, "keydown", e.keyCode ) );
			}
		}

	}
	
	function doKeyUp( e )
	{
		e = e ? e : window.event;
		spriteengine.keypresses[ e.keyCode ] = false;
		for( var l in spriteengine.listeners )
		{
			if( spriteengine.listeners[ l ][ 0 ] == "keyup" )
			{
				spriteengine.listeners[ l ][ 1 ]( new SpriteEngineEvent( spriteengine, "keyup", e.keyCode ) );
			}
		}
	} 
}

SpriteEngine.prototype.addEventListener = function( ev, f )
{
	this.listeners.push( [ ev, f ] );
}

SpriteEngine.prototype.addItemToLoad = function( src, ref )
{
	this.toloads.push( [ src, ref ] );
}

SpriteEngine.prototype.startLoad = function( callback )
{
	var toload = 0;
	var toloads = this.toloads;

	for( var tl in this.toloads )
	{
		var lastdot = this.toloads[ tl ][ 0 ].lastIndexOf( "." );
		var prefix = this.toloads[ tl ][ 0 ].substring( 0, lastdot );
		var suffix = this.toloads[ tl ][ 0 ].substring( lastdot );
		if( suffix == ".png" || suffix == ".jpg" || suffix == ".gif" )
		{
			this.toloads[ tl ][ 1 ].src = this.toloads[ tl ][ 0 ];
			this.toloads[ tl ][ 1 ].addEventListener( "load", doneLoad, false );
			this.toloads[ tl ][ 1 ].addEventListener( "error", errorLoad, false );
		}
		else if( suffix == ".ogg" )
		{
			if( this.ios )
			{
				toload++;
				callback( toload, toloads.length, this.toloads[ tl ][ 1 ], true );				
			}
			else
			{
				this.toloads[ tl ][ 1 ].addEventListener( "canplaythrough", doneLoad, false );
				this.toloads[ tl ][ 1 ].addEventListener( "error", errorLoad, false );
				if( this.toloads[ tl ][ 1 ].canPlayType( "audio/ogg" ) != "" )
				{
					this.toloads[ tl ][ 1 ].src = prefix + ".ogg";
				}
				else if( this.toloads[ tl ][ 1 ].canPlayType( "audio/mp3" ) != "" )
				{
					this.toloads[ tl ][ 1 ].src = prefix + ".mp3";
				}
				else if( this.toloads[ tl ][ 1 ].canPlayType( "audio/wav" ) != "" )
				{
					this.toloads[ tl ][ 1 ].src = prefix + ".wav";				
				}
				else
				{
					toloads++;
					callback( toload, toloads.length, this.toloads[ tl ][ 1 ], true );
				}
			}
		}
	}
	
	function doneLoad( e )
	{
		var suffix = e.target.src.substring( e.target.src.lastIndexOf( "." ) );
		if( suffix == ".mp3" || suffix == ".ogg" || suffix == ".wav" )
		{
			e.target.removeEventListener( "canplaythrough", doneLoad, false );
			toload++;
			callback( toload, toloads.length, e.target, false );		
		}
		else
		{
			toload++;
			callback( toload, toloads.length, e.target, false );
		}
	}
	
	function errorLoad( e )
	{
		if( e.target.src.indexOf( ".ogg", e.target.src.length - 4 ) != -1 )
		{
			e.target.removeEventListener( "canplaythrough", doneLoad, false );
		}
		toload++;
		callback( toload, toloads.length, e.target, true );
	}
}

SpriteEngine.prototype.isKeyPressed = function( code )
{
	return this.keypresses[ code ];
}

SpriteEngine.prototype.pressKey = function( code )
{
	this.keypresses[ code ] = true;
}

SpriteEngine.prototype.unpressKey = function( code )
{
	this.keypresses[ code ] = false;
}

SpriteEngine.prototype.addSprite = function( sprite, order )
{
	if( order == null )
		this.sprites.push( sprite );
	else
		this.sprites.splice( order, 0, sprite );
	
}

SpriteEngine.prototype.getSpriteCount = function( )
{
	return this.sprites.length;
}

SpriteEngine.prototype.getSpriteAt = function( i )
{
	return this.sprites[ i ];
}

SpriteEngine.prototype.bringSpriteToTop = function( sprite )
{
	var newsprites = [];
	for( var s = 0; s < this.sprites.length; s++ )
	{
		if( this.sprites[ s ] != sprite ) newsprites.push( this.sprites[ s ] );
	}
	newsprites.push( sprite );
	this.sprites = newsprites;
}

SpriteEngine.prototype.drawSprites = function( )
{
	if( this.draggedsprite )
	{
		this.draggedsprite.visible = this.mouseover;
		this.draggedsprite.x = this.mousex;
		this.draggedsprite.y = this.mousey;
	}
	for( var l in this.listeners )
	{
		if( this.listeners[ l ][ 0 ] == "redraw" )
		{
			this.listeners[ l ][ 1 ]( new SpriteEngineEvent( this, "redraw", null ) );
		}
	}
	for( var s in this.sprites )
	{
		var sprite = this.sprites[ s ];
		if( sprite.visible )
		{
			if( sprite.tween )
			{
				sprite.tween.calculate( sprite );
			}
			if( this.mouseover )
			{
				if( sprite.pointHitTest( this.mousex, this.mousey ) )
				{
					if( !sprite.mouseover )
					{
						sprite.mouseover = true;
						for( var l in sprite.listeners )
						{
							if( sprite.listeners[ l ][ 0 ] == "mousein" )
							{
								sprite.listeners[ l ][ 1 ]
									( new SpriteEvent( this.mousex, this.mousey, sprite, "mousein" ) );
							}
						}
					}
				}
				else
				{
					if( sprite.mouseover )
					{
						sprite.mouseover = false;
						for( var l in sprite.listeners )
						{
							if( sprite.listeners[ l ][ 0 ] == "mouseout" )
							{
								sprite.listeners[ l ][ 1 ]
									( new SpriteEvent( this.mousex, this.mousey, sprite, "mouseout" ) );
							}
						}
					}
				}
			}
		}
	}
	for( var s in this.sprites )
	{
		var sprite = this.sprites[ s ];
		if( sprite.visible )
		{
			for( var l in sprite.listeners )
			{
				if( sprite.listeners[ l ][ 0 ] == "redraw" )
				{
					sprite.listeners[ l ][ 1 ]
								( new SpriteEvent( this.mousex, this.mousey, sprite, "redraw" ) );
				}
			}
			if( sprite.type == "shape" )
			{
				this.context.fillStyle = sprite.colour;
				this.context.strokeStyle = sprite.linecolour;
				this.context.lineWidth = sprite.linewidth;
				this.context.beginPath( );
				for( var p = 0; p < sprite.points.length; p++ )
				{
					if( p == 0 )
						this.context.moveTo( sprite.x + ( sprite.points[ 0 ][ 0 ] * sprite.scalex ),
											sprite.y + ( sprite.points[ 0 ][ 1 ] * sprite.scaley ) );
					else
						this.context.lineTo( sprite.x + ( sprite.points[ p ][ 0 ]  * sprite.scalex ),
											sprite.y + ( sprite.points[ p ][ 1 ] * sprite.scaley ) );
				}
				this.context.fill( );
				if( sprite.linewidth != 0 )
				{
					this.context.lineTo( sprite.x + ( sprite.points[ 0 ][ 0 ] * sprite.scalex ),
										sprite.y + ( sprite.points[ 0 ][ 1 ] * sprite.scaley ) );
					this.context.stroke( );
				}
				this.context.closePath( );
			}
			else if( sprite.type == "bitmap" )
			{
				var persheet = Math.floor( sprite.bitmap.width / sprite.width );
				var ssx = ( Math.floor( sprite.frame ) % persheet ) * sprite.width;
				var ssy = Math.floor( sprite.frame / persheet ) * sprite.height;
				this.context.drawImage( sprite.bitmap, ssx, ssy, sprite.width, sprite.height,
										sprite.x - ( ( sprite.width * sprite.scalex ) / 2 ),
										sprite.y - ( ( sprite.height * sprite.scaley ) / 2 ),
										sprite.width * sprite.scalex, sprite.height * sprite.scaley );
			}
			else if( sprite.type == "button" )
			{
				this.context.fillStyle = sprite.colour;
				this.context.strokeStyle = sprite.linecolour;
				this.context.fillRect( sprite.x + ( sprite.minx * sprite.scalex ) + sprite.recoil,
										sprite.y + ( sprite.miny * sprite.scaley ) + sprite.recoil,
										sprite.width * sprite.scalex, sprite.height * sprite.scaley );
				this.context.strokeRect( sprite.x + ( sprite.minx * sprite.scalex ) + sprite.recoil,
										sprite.y + ( sprite.miny * sprite.scaley ) + sprite.recoil,
										sprite.width * sprite.scalex, sprite.height * sprite.scaley );
				this.context.fillStyle = sprite.linecolour;
				this.context.font = sprite.font;
				this.context.textAlign = "center";
				this.context.textBaseline = "middle";
				this.context.fillText( sprite.text, sprite.x + sprite.recoil, sprite.y + sprite.recoil );
				if( sprite.recoil > 0 ) sprite.recoil--;
			}
		}
	}
}

SpriteEngine.prototype.clearScreen = function( colour )
{
	this.context.fillStyle = colour;
	this.context.fillRect( 0, 0, this.canvaselement.width, this.canvaselement.height );
}

SpriteEngine.prototype.startDrag = function( s )
{
	if( s.tween ) s.tween.running = false;
	this.draggedsprite = s;
}

SpriteEngine.prototype.stopDrag = function( )
{
	this.draggedsprite = null;
}

/**
 * Class: SpriteTween holds tweening information for a simple tween on the (x, y) co-ordinates.
 * Each sprite has a tween property and if it is set, and started SpriteEngine.drawSprites calculates and
 * sets each sprites' tweened position before drawing the sprite. Tweens are only calculated by 
 * SpriteEngine.drawSprites. When a tween completes a callback function is called with a reference
 * to the sprite to which it is attached as an argument.
 */

function SpriteTween( startx, starty, endx, endy, easeinout, duration, callback )
{
	this.startx = startx;
	this.starty = starty;
	this.endx = endx;
	this.endy = endy;
	this.easeinout = easeinout;
	this.duration = duration;
	this.callback = callback;
	
	this.running = false;
	this.starttime = null;
}

SpriteTween.prototype.start = function( )
{
	this.running = true;
	this.starttime = new Date( ).getTime( );
}

SpriteTween.prototype.stop = function( )
{
	this.running = false;
}

SpriteTween.prototype.calculate = function( target )
{
	function linearTween( t, start, end, d )
	{
		return ( end - start ) * t / d + start;
	}
	
	function easeInOut( t, start, end, d )
	{
		var c = end - start;
		t /= d / 2;
		if ( t < 1 ) return c / 2 * t * t + start;
		t--;
		return -c / 2 * ( t * ( t - 2 ) - 1) + start;
	}
	
	if( this.running )
	{
		var t = new Date( ).getTime( ) - this.starttime;
		if( t >= this.duration )
		{
			t = this.duration;
			target.x = this.endx;
			target.y = this.endy;
			this.running = false;
			if( this.callback ) this.callback( target );
		}
		if( this.easeinout )
		{
			target.x = easeInOut( t, this.startx, this.endx, this.duration );
			target.y = easeInOut( t, this.starty, this.endy, this.duration );
		}
		else
		{
			target.x = linearTween( t, this.startx, this.endx, this.duration );
			target.y = linearTween( t, this.starty, this.endy, this.duration );			
		}
	}
}

function Sprite( type, arg1, arg2, arg3, arg4 )
{
	this.type = type;
	this.x = 0;
	this.y = 0;
	this.listeners = new Array( );
	this.tween = null;
	this.mouseover = false;
	this.scalex = 1;
	this.scaley = 1;
	this.visible = true;
	
	if( type == "shape" )
	{
		this.points = arg1;
		this.colour = ( !arg2 ? "#000000" : arg2 );
		this.linewidth = ( !arg3 ? 0 : arg3 );
		this.linecolour = ( !arg4 ? "#ffffff" : arg4 );
		this.maxx = this.points[ 0 ][ 0 ]; this.maxy = this.points[ 0 ][ 1 ];
		this.minx = this.points[ 0 ][ 0 ]; this.miny = this.points[ 0 ][ 1 ];
		this.reversepoints = new Array( );
		for( var p = 1; p < this.points.length; p++ )
		{
			if( this.points[ p ][ 0 ] > this.maxx ) this.maxx = this.points[ p ][ 0 ];
			if( this.points[ p ][ 1 ] > this.maxy ) this.maxy = this.points[ p ][ 1 ];
			if( this.points[ p ][ 0 ] < this.minx ) this.minx = this.points[ p ][ 0 ];
			if( this.points[ p ][ 1 ] < this.miny ) this.miny = this.points[ p ][ 1 ];
			var x0 = this.points[ p == 0 ? this.points.length - 1 : p - 1 ][ 0 ];
			var x1 = this.points[ p ][ 0 ];
			var x2 = this.points[ p == this.points.length - 1 ? 0 : p + 1 ][ 0 ];
			if( ( x0 < x1 && x2 < x1 ) || ( x0 > x1 && x2 > x1 ) )
			{
				this.reversepoints.push( this.points[ p ] );
			}
		}
		this.width = this.maxx - this.minx;
		this.height = this.maxy - this.miny;
	}
	else if( type == "bitmap" )
	{
		this.bitmap = arg1;
		this.width = arg2;
		this.height = arg3;
		this.frame = 0;
		this.minx = -( arg2 / 2 );
		this.maxx = arg2 / 2;
		this.miny = -( arg3 / 2 );
		this.maxy = arg3 / 2;
	}
	else if( type == "button" )
	{
		this.text = arg1;
		this.width = arg2;
		this.height = arg3;
		this.font = ( arg4 ? arg4 : "18px Arial" );
		this.colour = "#ffffff";
		this.linecolour = "#000000";
		this.pressoffset = 3;
		this.minx = -( arg2 / 2 );
		this.maxx = arg2 / 2;
		this.miny = -( arg3 / 2 );
		this.maxy = arg3 / 2;
		this.recoil = 0;

	}
}

Sprite.prototype.addEventListener = function( ev, f )
{
	this.listeners.push( [ ev, f ] );
}

Sprite.prototype.pointHitTest = function( testx, testy )
{
	function intersectsYAxis( x, y, x1, y1, x2, y2 )
	{
		if( ( x1 > x && x2 > x ) || ( x1 < x && x2 < x ) )
		{
			return null;
		}
		else if( ( y1 < y ) && ( y2 < y ) )
		{
			return null;
		}
		else if( x1 == x2 )
		{
			if ( ( y1 <= y && y <= y2  ) || ( y1 >= y && y >= y2 ) )
				return 1;
			else if( y < y1 && y < y2 )
				return 2
			else
				return null;
		}
		else
		{
			var x1d = x1 - x; var x2d = x2 - x;
			var y1d = y1 - y; var y2d = y2 - y;
			
			if( y1d == y2d )
			{
				if( y1d > 0 )
					return [ Math.floor( x ), Math.floor( y1d + y ) ];
				else
					return null;
			}
			var m = ( y1d - y2d ) / ( x1d - x2d );
			var c = ( m * x1d ) - y1d;
			if( c < 0 )
				return [ Math.floor( x ), Math.floor( y - c ) ];
			else
				return null;
		}
	}
	
	if( testx < ( this.minx * this.scalex ) + this.x || testx > ( this.maxx * this.scalex ) + this.x ||
		testy < ( this.miny * this.scaley ) + this.y || testy > ( this.maxy * this.scaley ) + this.y  )
	{
		return false;
	}
	else if( this.type == "shape" )
	{
		var intersects = new Array( );
		var hintersects = 0;
		for( var p = 0; p < this.points.length; p++ )
		{
			var ipoint = intersectsYAxis( testx, testy,
									( this.points[ p == 0 ? this.points.length - 1 : p - 1 ][ 0 ] * this.scalex ) + this.x,
									( this.points[ p == 0 ? this.points.length - 1 : p - 1 ][ 1 ] * this.scaley ) + this.y,
									( this.points[ p ][ 0 ] * this.scalex ) + this.x,
									( this.points[ p ][ 1 ] * this.scaley ) + this.y );
			if( ipoint != null )
			{
				if( ipoint == 1 ) 
				{
					return true;
				}
				else if( ipoint == 2 )
				{
					hintersects++
				}
				else
				{
					var found = false;
					for( var i in intersects )
					{
						if( intersects[ i ][ 0 ] == ipoint[ 0 ] &&
							intersects[ i ][ 1 ] == ipoint[ 1 ] ) found = true;
					}
					for( var rp in this.reversepoints )
					{
						if( ( this.reversepoints[ rp ][ 0 ] * this.scalex ) + this.x == testx &&
							( this.reversepoints[ rp ][ 1 ] * this.scaley ) + this.y == testy ) return true;
						if( ( this.reversepoints[ rp ][ 0 ] * this.scalex ) + this.x == ipoint[ 0 ]  &&
							( this.reversepoints[ rp ][ 1 ] * this.scaley ) + this.y == ipoint[ 1 ] )
							found = true;
					}
					if( !found ) intersects.push( ipoint );
				}
			}
		}
		return ( intersects.length + hintersects ) % 2 != 0;
	}
	else
	{
		return true;
	}
}

Sprite.prototype.startTween = function( )
{
	if( this.tween )
	{
		if( this.tween.startx == null ) this.tween.startx = this.x;
		if( this.tween.starty == null ) this.tween.starty = this.y;
		this.tween.start( );
	}
}

Sprite.prototype.stopTween = function( )
{
	if( this.tween )
	{
		this.tween.stop( );
	}
}

Sprite.prototype.collisionDetect = function( testsprite )
{
	if( ( this.maxx * this.scalex ) + this.x < ( testsprite.minx * testsprite.scalex ) + testsprite.x ) return false;
	if( ( this.maxy * this.scaley ) + this.y < ( testsprite.miny * testsprite.scaley ) + testsprite.y ) return false;
	if( ( this.miny * this.scaley ) + this.y > ( testsprite.maxy * testsprite.scaley ) + testsprite.y ) return false;
	if( ( this.minx * this.scalex ) + this.x > ( testsprite.maxx * testsprite.scalex ) + testsprite.x ) return false;
	return true;
}
