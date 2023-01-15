
class Component {
    constructor(x,y, width = 8, height = 8) {
        this.micro = null;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.children = {}
    }

    render(canvas) {}
    update(dt) {}
    onCollision(components) {}

    onKey(event) {}

    add(id, component) {
        component.micro = this.micro;
        component.x = this.x + component.x;
        component.y = this.y + component.y;
        this.children[id] = component;
    }

    delete(id) {
        delete this.children[id];
    }

    collide(component) {
        return this.x < component.x + component.width &&
        this.x + this.width > component.x &&
        this.y < component.y + component.height &&
        this.height + this.y > component.y;
    }

    _render(canvas) {
        this.render(canvas);
        for (let id of Object.keys(this.children)) {
            const child = this.children[id];
            child._render(canvas);
        }
    }

    _update(dt) {
        this.update(dt);
        for (let id of Object.keys(this.children)) {
            const child = this.children[id];
            child._update(dt);
        }
    }

    _onKey(event) {
        this.onKey(event);
        for (let id of Object.keys(this.children)) {
            const child = this.children[id];
            child._onKey(event);
        }
    }

    _onCollision(components) {
        this.onCollision(components);
        for(let id of Object.keys(this.children)) {
            const child = this.children[id];
            child._onCollision(components);
        }
    }
}

class Sprite extends Component {
    constructor(x,y, bitmap) {
        super(x,y);
        this.bitmap = bitmap;
    }

    render(canvas) {
        canvas.drawSprite(this.x, this.y, this.bitmap);
    }
}

class AnimatedSprite extends Component {
    constructor(x, y, bitmaps, delay=500) {
        super(x,y);
        this.bitmaps = bitmaps;
        this.delay = delay;
        this.nbitmap = 0;
        this.time = 0;
    }

    render(canvas) {
        const bitmap = this.bitmaps[this.nbitmap];
        canvas.drawSprite(this.x, this.y, bitmap);
    }

    update(dt) {
        this.time += dt;
        if (this.time > this.delay) {
            this.time = 0;
            this.nbitmap = (this.nbitmap + 1) % this.bitmaps.length;
        }
    }
}

class Canvas {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.width = config.width;
        this.height = config.height;
        this.scale = config.scale;
        this.offset = (config.scale > 1) ? 2 : 0;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getScale() {
        return this.scale;
    }

    getSize() {
        return {
            width: this.width,
            height: this.height,
            scale: this.scale
        }
    }

    clear() {
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.fillRect(0,0,this.scale * this.width, this.scale * this.height);
    } 

    grid() {
        this.ctx.fillStyle = "rgb(255, 255, 255)";
       for (let i = 0; i < 128; i++) {
            for (let j = 0; j < 128; j++) {
                this.ctx.fillRect(this.scale * i, this.scale * j, this.scale - this.offset, this.scale - this.offset);
            }
        }
    }

    drawPixel(x, y, color="rgb(255,255,255)") {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(this.scale * x, this.scale * y, this.scale - this.offset, this.scale - this.offset);
    }

    drawRectangle(x, y, width, height, color="rgb(255,255,255)") {
        this.ctx.fillStyle = color;
        //ctx.fillRect(this.scale * x, this.scale * y, this.scale * width - this.offset, this.scale * height - this.offset);
        for(let i = 0; i < width; i++) {
            for(let j = 0; j < height; j++) {
                this.ctx.fillRect(this.scale * (x + i), this.scale * (y + j), this.scale - this.offset, this.scale - this.offset);
            }
        }
    }

    drawSquare(x, y, length, color="rgb(255,255,255)") {
        this.drawRectangle(x,y, length, length, color);
    }

    drawSprite(x,y, sprite, color="rgb(255,255,255") {
        const width = sprite[0].length;
        const height = sprite.length;

        for (let i = 0; i < height; i ++) {
            for (let j = 0; j < width; j++) {
                const pixel = sprite[i][j];
                if (pixel === 1) {
                    this.drawPixel(x + j, y + i, color);
                }
            }
        }
    }

    drawText(x,y, text, color="rgb(255,255,255") {
        this.ctx.fillStyle = color;
        this.ctx.font = "18px Arial";
        this.ctx.fillText(text, x, y);
    }
}

class Micro {
    constructor(ctx, config={
        width: 128,
        height: 128,
        scale: 4
    }) {
        this.ctx = ctx;
        this.config = config;
        this.canvas = new Canvas(ctx, config);
        this.fps = 30;
        this.components = {};
        this.event = {};
    }
      

    add(id, component) {
        component.micro = this;
        this.components[id] = component;
    }

    delete(id) {
        delete this.components[id];
    }

    render() {
        this.canvas.clear();
        for (let id of Object.keys(this.components)) {
            const component = this.components[id];
            component._render(this.canvas);
        }    
    }

    update(dt) {
        for (let id of Object.keys(this.components)) {
            const component = this.components[id];
            component._update(dt);
        }  
    }

    onKey(event) {
        for (let id of Object.keys(this.components)) {
            const component = this.components[id];
            component._onKey(event);
        }  
    }

    onCollision() {
        for (let id of Object.keys(this.components)) {
            const component = this.components[id];
            component._onCollision(this.components);
        }
    }

    _input() {
        window.addEventListener('keydown', (e) => {
            this.event[e.keyCode] = true;
        })

        window.addEventListener('keyup', (e) => {
            this.event[e.keyCode] = false;
        })
    };

    loop() {
        //register keyboards events
        this._input();
        //start game loop
        let start = Date.now();
        setInterval(() => {
            let now = Date.now();
            let dt = now - start;
            start = now;
            this.onKey(this.event);
            this.render();
            this.update(dt);
            this.onCollision();

        }, 1000/this.fps);
    }
}

export {Micro, Component, Sprite, AnimatedSprite};