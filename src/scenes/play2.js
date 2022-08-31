// Declaracion de variables para esta escena
let player;
let stars;
let bombs;
let cursors;
let score;
let gameOver;
let scoreText;
let win=0;

// Clase Play, donde se crean todos los sprites, el escenario del juego y se inicializa y actualiza toda la logica del juego.
export class Play2 extends Phaser.Scene {
  constructor() {
    // Se asigna una key para despues poder llamar a la escena
    super("Play2");
  }

  preload() {
    this.load.tilemapTiledJSON("map2", "public/assets/tilemaps/map2.json");
    this.load.image("tilesBelow2", "public/assets/images/sky_atlas.png");
    this.load.image("tilesPlatform2", "public/assets/images/platform_atlas2.png");
  }

  create() {
    console.log("escena2")
    const map2 = this.make.tilemap({ key: "map2" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tilesetBelow2 = map2.addTilesetImage("sky_atlas", "tilesBelow");
    const tilesetPlatform2 = map2.addTilesetImage(
      "platform_atlas",
      "tilesPlatform2"
    );

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = map2.createLayer("Fondo", tilesetBelow2, 0, 0);
    const worldLayer2 = map2.createLayer("Plataformas", tilesetPlatform2, 0, 0);
    const objectsLayer2 = map2.getObjectLayer("Objetos");

    worldLayer2.setCollisionByProperty({ collides: true });

    // tiles marked as colliding
    /*
    const debugGraphics = this.add.graphics().setAlpha(0.75);
    worldLayer.renderDebug(debugGraphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
    });
    */

    // Find in the Object Layer, the name "dude" and get position
    const spawnPoint = map2.findObject("Objetos", (obj) => obj.name === "dude");
    // The player and its settings
    player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "dude");

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Input Events
    if ((cursors = !undefined)) {
      cursors = this.input.keyboard.createCursorKeys();
    }

    // Create empty group of starts
    stars = this.physics.add.group();

    // find object layer
    // if type is "stars", add to stars group
    objectsLayer2.objects.forEach((objData) => {
      //console.log(objData.name, objData.type, objData.x, objData.y);

      const { x = 0, y = 0, name, type } = objData;
      switch (type) {
        case "stars": {
          // add star to scene
          // console.log("estrella agregada: ", x, y);
          var star = stars.create(x, y, "star");
          star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
          break;
        }
      }
    });

    // Create empty group of bombs
    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(30, 6, "Score: 0", {
      fontSize: "32px",
      fill: "#fff",
    });

    // Collide the player and the stars with the platforms
    // REPLACE Add collision with worldLayer
    this.physics.add.collider(player, worldLayer2);
    this.physics.add.collider(stars, worldLayer2);
    this.physics.add.collider(bombs, worldLayer2);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, this.collectStar, null, this);

    this.physics.add.collider(player, bombs, this.hitBomb, null, this);

    gameOver = false;
    score = 0;
  }

  update() {
    if (win==3){
      win=0;
      this.scene.start(
       "Play3");
 
     }

    if (gameOver) {
      return;
    }

    if (cursors.left.isDown) {
      player.setVelocityX(-160);

      player.anims.play("left", true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);

      player.anims.play("right", true);
    } else {
      player.setVelocityX(0);

      player.anims.play("turn");
    }

    // REPLACE player.body.touching.down
    if (cursors.up.isDown && player.body.blocked.down) {
      player.setVelocityY(-330);
    }
  }

  collectStar(player, star) {
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText("Score: " + score);

    if (stars.countActive(true) === 0) {
      //  A new batch of stars to collect
      stars.children.iterate(function (child) {
        child.enableBody(true, child.x, child.y, true, true);
      });

      let x =
        player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      let bomb = bombs.create(x, 16, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

      win++;
    }
  }

  hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play("turn");

    gameOver = true;

    // Función timeout usada para llamar la instrucción que tiene adentro despues de X milisegundos
    setTimeout(() => {
      // Instrucción que sera llamada despues del segundo
      this.scene.start(
        "Retry",
        { score: score } // se pasa el puntaje como dato a la escena RETRY
      );
    }, 1000); // Ese número es la cantidad de milisegundos
  }
}
