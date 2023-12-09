const SPACESHIP_ANTIMATION_MS = 500
const SPACESHIP_MOVE_STEP = 100
const SPACESHIP_SPEED = 1000
const ROCKET_ANIMATION_MS = 1000

const MISSILE_SHOT_AUDIO = "assets/shot.mp3"
const MISSILE_SHOT_VOLUME = 0.4
const BOMB_DROP_AUDIO = "assets/bomb.mp3"
const BOMB_DROP_VOLUME = 0.3

const EXPLOSION_GIF = "assets/explosion.gif"
const SPACESHIP_IMG = "assets/spaceship.png"

/*
 This class represents a single bomb that every Invader owns
*/
class Bomb {
    element;

    bombSound = new Audio(BOMB_DROP_AUDIO)

    constructor(element) {
        this.element = element;
        this.bombSound.volume = BOMB_DROP_VOLUME
    }

    isBombOnScreen() {
        return this.element.position().top > 0;
    }

    drop(invaderX, invaderY) {
        if (this.isBombOnScreen()) {
            return false
        }
        this.element.css({
            left: invaderX - this.element.width() / 2,
            top: invaderY,
        })
        this.element
            .animate({ top: [600, "linear"] }, 4000) // drop bomb 
            .animate({ top: -1000 }, 0) // hide it

        this.bombSound.play()
    }

    destroy() {
        this.element.stop();

        this.element.css({
            top: -100
        })
    }

    getCoordinates() {
        // Missile is using position: absolute, thus no need in taking offset
        var posX = this.element.position().left
        var posY = this.element.position().top
        var posX2 = posX + this.element.width()
        var posY2 = posY + this.element.height()

        return [posX, posY, posX2, posY2]
    }

}

class Invader {

    element;
    id;
    bomb = new Bomb()

    constructor(id, element) {
        this.element = element;
        this.id = id;
        this.bomb = this.createBomb();
    }

    createBomb() {
        var bombElement = $(".bomb").first().clone();
        bombElement.show()
        bombElement.appendTo(".game-field");
        return new Bomb(bombElement);
    }

    destroy() {
        this.element.attr('src', EXPLOSION_GIF);
        this.element.animate({ opacity: 0.0 }, 1300)
    }

    getCoordinates() {
        var offset = this.element.offset();

        var posX = offset.left - $(window).scrollLeft();
        var posY = offset.top - $(window).scrollTop();
        var posX2 = posX + this.element.width()
        var posY2 = posY + this.element.height()

        return [posX, posY, posX2, posY2]
    }

    dropBomb() {
        let invaderCoordinates = this.getCoordinates();
        this.bomb.drop(invaderCoordinates[0] + this.element.width() / 2, invaderCoordinates[1] + this.element.height())
    }
}


/*
 This class represents a single missle that Player's spaceship has
*/
class Missile {

    fireSound = new Audio(MISSILE_SHOT_AUDIO)
    element;

    constructor(element) {
        this.element = element;
        this.fireSound.volume = MISSILE_SHOT_VOLUME
    }

    isMissileOnScreen() {
        return this.element.position().top > 0;
    }

    fire(fromX, fromY) {
        if (this.isMissileOnScreen()) {
            return
        }

        this.element.stop();

        this.element.css({
            left: fromX - this.element.width() / 2,
            top: fromY
        })

        this.element.animate({ top: -100 }, ROCKET_ANIMATION_MS);

        this.fireSound.play();
    }

    destroy() {
        this.element.stop();

        this.element.css({
            top: -100
        })
    }

    getCoordinates() {
        // Missile is using position: absolute, thus no need in taking offset
        var posX = this.element.position().left
        var posY = this.element.position().top
        var posX2 = posX + this.element.width()
        var posY2 = posY + this.element.height()

        return [posX, posY, posX2, posY2]
    }

}

/**
 * This class represents a spaceship that controlled by player.
 */
class Spaceship {
    element
    missile = new Missile($(".missile").first());

    isReady = false

    constructor(spaceshipClassName) {
        this.element = $(spaceshipClassName)
    }

    // Initialise Player's Spaceship and prepare it for flight
    prepareForFlight() {
        this.element.attr('src', SPACESHIP_IMG);

        let xPos = (this.element.parent().width() - this.element.width()) / 2;
        let spaceship = this

        this.element.animate({ left: xPos, opacity: 1.0 }, 1000, function () { spaceship.isReady = true })
    }

    getCoordinates() {
        var offset = this.element.offset();

        var posX = offset.left - $(window).scrollLeft();
        var posY = offset.top - $(window).scrollTop();
        var posX2 = posX + this.element.width()
        var posY2 = posY + this.element.height()

        return [posX, posY, posX2, posY2]
    }

    moveSpaceship(position) {
        if (!this.isReady) {
            return
        }

        var distance = Math.abs(this.element.position().left - position)
        var animationDuration = distance / SPACESHIP_SPEED * 1000;

        this.element.stop(); // stop previous animation
        this.element.animate({ left: position }, animationDuration);
    }

    moveRight() {
        var screenSize = this.element.parent().width()
        var maxPosition = screenSize - this.element.width()

        this.moveSpaceship(maxPosition)
    }

    moveLeft() {
        this.moveSpaceship(0)
    }

    stop() {
        if (!this.isReady) {
            return
        }

        this.element.stop()
    }

    fire() {
        if (!this.isReady) {
            return
        }

        var spaceshipCenterX = this.element.position().left + this.element.width() / 2
        var spaceshipPosY = this.element.position().top

        this.missile.fire(
            spaceshipCenterX,
            spaceshipPosY
        )
    }

    destroy() {
        if (!this.isReady) {
            return
        }

        this.isReady = false

        let spaceship = this

        this.element.attr('src', EXPLOSION_GIF);
        this.element.animate({ opacity: 0.0 }, 1300, function () {
            spaceship.prepareForFlight()
        })
    }

    hide() {
        this.stop(true)
        this.element.css({ left: -100 });
    }

} 
