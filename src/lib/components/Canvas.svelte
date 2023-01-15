<script>
  import { onMount } from "svelte";
  import { Micro, Component, Sprite, AnimatedSprite } from "$lib/engine/micro";

  let config = {
    width: 128,
    height: 128,
    scale: 4,
  };

  let canvas = undefined;
  let ctx = undefined;
  let micro = undefined;

  onMount(() => {
    ctx = canvas.getContext("2d");

    micro = new Micro(ctx, config);

    class Score extends Component {
      constructor(x, y, text = "") {
        super(x, y);
        this.text = text;
      }

      render(canvas) {
        canvas.drawText(this.x, this.y, this.text);
      }
    }

    let naliens = 0;
    const score = new Score(10, 20, `Score: ${naliens}`);
    micro.add("score", score);

    class Alien extends AnimatedSprite {
      constructor(x, y, bitmaps, delay) {
        super(x, y, bitmaps, delay);
        this.direction = 1;
        this.nproj = 0;
        this.bitmaps = [
          [
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 1, 1, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 1, 1, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 1, 1, 0, 1, 0],
            [0, 0, 1, 0, 0, 1, 1, 0],
            [0, 1, 0, 1, 1, 0, 1, 0],
          ],
          [
            [0, 1, 0, 1, 0, 1, 1, 0],
            [0, 1, 0, 1, 1, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 1, 1, 0, 1, 0],
            [0, 1, 1, 0, 1, 1, 1, 0],
            [0, 1, 0, 1, 1, 0, 1, 0],
            [0, 0, 1, 0, 0, 0, 1, 0],
            [0, 1, 0, 1, 1, 0, 1, 0],
          ],
          [
            [0, 1, 1, 1, 0, 1, 1, 0],
            [0, 1, 0, 1, 1, 0, 1, 0],
            [0, 1, 0, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 0, 1, 0],
            [0, 1, 1, 0, 1, 1, 1, 0],
            [0, 1, 0, 1, 1, 0, 1, 0],
            [0, 0, 1, 1, 1, 0, 1, 0],
            [0, 1, 0, 1, 1, 0, 1, 0],
          ],
        ];
      }

      update(dt) {
        super.update(dt);
        if (this.direction == 1) {
          this.x += 1;
        } else {
          this.x -= 1;
        }
        if (this.x > 120) {
          this.direction = 0;
          this.y += 10;
        }
        if (this.x < 0) {
          this.direction = 1;
          this.y += 10;
        }

        let r = Math.random() * 1000;
        if (r > 990) {
          const proj = new Component(4, 0);
          const id = (Math.random() + 1).toString(36).substring(7);
          if (this.nproj < 1) {
            this.nproj++;
            proj.render = (canvas) => {
              canvas.drawSquare(proj.x, proj.y, 2);
            };
            proj.update = (dt) => {
              proj.y += 2;
              if (proj.y > 120) {
                this.delete(id);
                this.nproj--;
              }
            };
            proj.onCollision = (components) => {
              const component = components["spaceship"];
              if (proj.collide(component)) {
                this.delete(id);
                this.nproj--;
                console.log("you have been hit");
              }
            };
            this.add(id, proj);
          }
        }
      }
    }

    for (let i = 0; i < 10; i++) {
      const alien = new Alien(i * 20, 20, null, 100);
      micro.add(`alien${i}}`, alien);
    }

    class SpaceShip extends AnimatedSprite {
      constructor(x, y, bitmaps, delay) {
        super(x, y, bitmaps, delay);

        this.stop = 0;
        this.left = 1;
        this.right = 2;
        this.up = 3;
        this.down = 4;

        this.speed = 4;
        this.nproj = 0;

        this.direction = this.stop;

        this.bitmaps = [[
          [0, 1, 0, 0, 0, 0, 1, 0],
          [0, 1, 0, 0, 0, 0, 1, 0],
          [0, 1, 0, 0, 0, 0, 1, 0],
          [0, 1, 0, 1, 1, 0, 1, 0],
          [0, 1, 1, 1, 1, 1, 1, 0],
          [0, 1, 0, 1, 1, 0, 1, 0],
          [0, 1, 0, 0, 0, 0, 1, 0],
          [0, 0, 0, 1, 1, 0, 0, 0],
        ],[
          [0, 1, 0, 0, 0, 0, 1, 0],
          [0, 1, 0, 0, 0, 0, 1, 0],
          [0, 1, 0, 0, 0, 0, 1, 0],
          [0, 1, 0, 1, 1, 0, 1, 0],
          [0, 1, 1, 1, 1, 1, 1, 0],
          [0, 1, 0, 1, 1, 0, 1, 0],
          [0, 1, 0, 0, 0, 0, 1, 0],
          [0, 0, 0, 0, 1, 0, 0, 0],
        ],[
          [0, 1, 0, 0, 0, 0, 1, 0],
          [0, 1, 0, 0, 0, 0, 1, 0],
          [0, 1, 0, 0, 0, 0, 1, 0],
          [0, 1, 0, 1, 1, 0, 1, 0],
          [0, 1, 1, 1, 1, 1, 1, 0],
          [0, 1, 0, 1, 1, 0, 1, 0],
          [0, 1, 0, 0, 0, 0, 1, 0],
          [0, 0, 0, 1, 0, 0, 0, 0],
        ]];
      }

      // render(canvas) {
      //   canvas.drawSprite(this.x, this.y, this.bitmaps);
      // }

      update(dt) {
        super.update(dt);
        switch (this.direction) {
          //left
          case this.left:
            this.x -= this.speed;
            if (this.x < 0) this.x = 0;
            break;
          //right
          case this.right:
            this.x += this.speed;
            if (this.x > 120) this.x = 120;
            break;
          //up
          case this.up:
            this.y -= this.speed;
            break;
          //down
          case this.down:
            this.y += this.speed;
            break;
          default:
            break;
        }
      }

      onKey(event) {
        //console.log(event);
        const space = event[32];
        const left = event[37];
        const right = event[39];
        //const up = event[38];
        //const down = event[40];

        const nothing = (left == false && right == false);
        if (nothing) {
            this.direction = this.stop;
        }

        if (left) this.direction = this.left;
        if (right) this.direction = this.right;
        //if (up) this.direction = this.up;
        //if (down) this.direction = this.down;

        if (space) {
          const proj = new Component(4, 0);
          const id = (Math.random() + 1).toString(36).substring(7);
          if (this.nproj < 1) {
            this.nproj++;
            proj.render = (canvas) => {
              canvas.drawSquare(proj.x, proj.y, 2);
            };
            proj.update = (dt) => {
              proj.y -= 4;
              if (proj.y < 0) {
                this.delete(id);
                this.nproj--;
              }
            };
            proj.onCollision = (components) => {
              for (let _id of Object.keys(components)) {
                const component = components[_id];
                if (_id === "spaceship") continue;
                if (proj.collide(component)) {
                  naliens++;
                  score.text = `Score: ${naliens}`;
                  proj.micro.delete(_id);
                  this.delete(id);
                  this.nproj--;
                  break;
                }
              }
            };
            this.add(id, proj);
          }
        }
      }
    }

    const spaceship = new SpaceShip(60, 110, null, 50);

    micro.add("spaceship", spaceship);
    micro.loop();
  });
</script>

<div
  class="p-2 w-[528px] h-[528px] rounded-xl bg-slate-800 text-slate-200 content-center"
>
  <canvas
    class=""
    bind:this={canvas}
    width={config.width * config.scale}
    height={config.height * config.scale}
  />
</div>
