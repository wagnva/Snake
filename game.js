function main(){
 
    var grid = {
        gridX: 0,
        gridY: 0,
        init: function(_gridX, _gridY, $_table){
            this.gridX = _gridX;
            this.gridY = _gridY;
            
            //Calculate the cell width
            var cellWidth = $_table.parent().parent().width() / _gridX;
            
            //loop through the width and height and create all the table cells with data attributes for x and y and the calculated cell size
            $_table.empty();
            var toAdd = "";
            for(var y = 0; y < _gridY; y++){
                toAdd += "<tr>";
                for(var x = 0; x < _gridX; x++){
                    toAdd += "<td data-x='" + x + "' data-y='" + y + "' style='min-width: " + cellWidth + "px; height: " + cellWidth + "px'> </td>";
                }
                toAdd += "</tr>";
            }
            $_table.html(toAdd);
        },
        clear: function($_table){
            //clear the grid off all the data attributes
            $_table.find("[data-snake=true]").attr("data-snake", "false");
            $_table.find("[data-snakehead=true]").attr("data-snakehead", "false");
        },
        getElementAt: function(_x,_y){
            //get the element at a specific position of the grid
            return $("[data-x=" + _x + "][data-y=" +_y + "]");
        }
    }
    
    var snake = {
        _pos: {
            x: 0,
            y: 0,
            direction: "right"
        },
        _queue: [],
        _addNewPiece: false,
        init: function(dir, x, y){
            this._pos.x = x || Math.round(grid.gridX/2);
            this._pos.y = y || Math.round(grid.gridY/2);
            this._pos.direction = dir || "right";
            
            this._queue = [];
            
            //add 3 tail pieces
            for(var i = -3; i < 0;i++){
                this._queue.push({x: this._pos.x + i, y: this._pos.y});
            }
            
            /* Setup keylistener */
            document.addEventListener("keydown", this.keyDownHandler, false);
        },
        update: function($_table){
            
            /* Updating */
            //If there is not a new tail piece added
            //move the first element from the queue to the end
            //and change its position to the heads position
            //-> creates the illusion of the snake body following the head
            if(!this._addNewPiece){
                var firstElement = this._queue[0];
                firstElement.x = this._pos.x;
                firstElement.y = this._pos.y;
                this._queue.shift();
                this._queue.push(firstElement);
            }else{
                //If there should be a new tail piece added
                //create the element, change its position to the heads position
                //and add it to the queue
                var newTailPiece = {};
                newTailPiece.x = this._pos.x;
                newTailPiece.y = this._pos.y;
                this._queue.push(newTailPiece);
                
                this._addNewPiece = false;
            }
            
            //updating the header _pos
            switch(this._pos.direction){
                case "top":
                    this._pos.y--;
                    break;
                case "bottom":
                    this._pos.y++;
                    break;
                case "left":
                    this._pos.x--;
                    break;
                case "right":
                    this._pos.x++;
                    break;
            }
            
            //check if the snake collided with itself or the wall
            if(this.checkGameLost()){
                //console.log("YOU LOST!!");
                game.stop();
            }
            
            //check if snake ate the food by comparing the new head position with the food location
            //if yes, spawn a new food piece, allow a new tail piece to be added and update the score
            if(this._pos.x === food.current.x && this._pos.y === food.current.y){
                this._addNewPiece = true;
                game.addToScore(food.current.scoreToAdd);
                food.spawnNew();
            }
            
            /* Rendering */
            //display head element
            grid.getElementAt(this._pos.x,this._pos.y).attr("data-snakehead", "true");
            
            //display the tail
            for(var i = 0; i < this._queue.length; i++){
                grid.getElementAt(this._queue[i].x, this._queue[i].y).attr("data-snake", "true");
            }
        },
        checkGameLost: function(){
          //check if the snake head is "bitting" its tail
          for(var i = 0; i < this._queue.length; i++){
              var current = this._queue[i];
              if(current.x === this._pos.x && current.y === this._pos.y){
                  return true;
              }
          }  
          //check if the snake is out of the grid bounds
          if(this._pos.x < 0 || this._pos.x >= grid.gridX || this._pos.y < 0 || this._pos.y >= grid.gridY){
              return true;
          }
          return false;
        },
        keyDownHandler: function(event){
            /* Always check if the pressed arrow ist the opposite of the current direction, so that the snake doesnt run into itself that easily by                  just pressing one wrong button */
            
            /* Right Arrow */
            if(event.keyCode === 39 && !(snake._pos.direction === "left")){
                snake._pos.direction = "right";
                event.preventDefault();
            }else
            /* Left Arrow */
            if(event.keyCode === 37 && !(snake._pos.direction === "right")){
                snake._pos.direction = "left";
                event.preventDefault();
            }else
            /* Top Arrow */
            if(event.keyCode === 38 && !(snake._pos.direction === "bottom")){
                snake._pos.direction = "top";
                event.preventDefault();
            }else
            /* Bottom Arrow */
            if(event.keyCode === 40 && !(snake._pos.direction === "top")){
                snake._pos.direction = "bottom";
                event.preventDefault();
            }
        }
    }
    
    var food = {
        current: {
            x: 0,
            y: 0,
            scoreToAdd: 1
        },
        spawnNew: function(){
            //remove the old ones
            game.$table.find("[data-food=true]").attr("data-food", "false");
            game.$table.find("[data-foodRare=true]").attr("data-foodRare", "false");
            
            //calculate a random cell
            var randX = Math.round(Math.random() * (grid.gridX - 1)),
                randY = Math.round(Math.random() * (grid.gridY - 1));
            
            //console.log(randX + " | " + randY);
            var cell = grid.getElementAt(randX, randY);
            
            //if the random cell is already occupied by the snake, call the method again to calculate a new cell and return
            if(cell.attr("data-snake") || cell.attr("data-snakehead")){
                //console.log("recalculated");
                this.spawnNew();
                return;
            }
            
            this.current.x = randX;
            this.current.y = randY;
            
            //check if the food is supposed to be a rare one
            var rare = Math.random() >= 0.80;
            
            if(rare){
                this.current.scoreToAdd = 10;
                cell.attr("data-foodRare", "true");
            }else{
                this.current.scoreToAdd = 1;
                cell.attr("data-food", "true");
            }
        }
    }
    
    var game = {
        $table: null,
        $lose: null,
        $score: null,
        running : false,
        restarting: false,
        score: 0,
        init: function(_gridX, _gridY, $_table, $_lose, $_score){
            var gridX = _gridX || 50,
                gridY = _gridY || 30;
                this.$table = $_table || $("table tbody");
                this.$lose = $_lose || $(".game-lost");
                this.$score = $_score || $(".game-score span");
            
            //reset
            this.$lose.css("display", "none");
            this.score = 0;
            this.$score.text(this.score);
            
            //set the event listener on the $loose button
            this.$lose.find("button").on("click", function(event){
                game.init(_gridX, _gridY, $_table, $_lose, $_score);
            });
            
            //setup the grid & snake and spawn the first food piece
            grid.init(gridX,gridY, this.$table);
            snake.init();
            food.spawnNew();
            
            //start the game loop
            //if restarting, make sure the game loop doesnt get started again
            this.running = true;
            if(!this.restarting){
                setInterval(function(){
                    if(game.running){
                        game.update();
                    }
                }, 1000/10);
            }
        },
        update: function(){
            //clear the grid and update the snake
            grid.clear(this.$table);
            snake.update(this.$table);
        },
        stop: function(){
            this.running = false;
            this.restarting = true;
            this.$lose.css("display", "block");
        },
        addToScore: function(val){
            //add and display the new updated score
            this.score += val || 1;
            this.$score.text(this.score);
        }
        
    };
    
    //init the game, but pause it
    game.init(50,30, $("main #game-table tbody"), $(".game-lost"), $(".game-score span"));
    game.running = false;
    
    //when the play button is pressed, make the overlay disappear and run the game
    $(".game-start button").on("click", function(event){
       $(".game-start").css("display", "none");
       game.running = true;
    });
}

$(document).ready(main);