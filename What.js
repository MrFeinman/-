let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
let sizeGrid = 15; //Размер сетки

let GridWidth = 60; //111
let GridHeight = 30; //55
let FoodNumber = 120; //300
let DiodNumber = 25; //100
let Grids = new Array(GridWidth);
let colours = ['#0f00ff','#1f00ff','#2f00ff','#3f00ff','#4f00ff','#5f00ff','#6f00ff','#7f00ff','#8f00ff','#9f00ff','#af00ff','#bf00ff','#cf00ff','#df00ff','#ef00ff','#ff00ff','#ff00f0','#ff00e0','#ff00d0','#ff00c0','#ff00b0','#ff00a0','#ff0090','#ff0080','#ff0070','#ff0060','#ff0050','#ff0040','#ff0030','#ff0020','#ff0010','#ff0000','#ff0010','#ff0020','#ff0030','#ff0040','#ff0050','#ff0060','#ff0070','#ff0080','#ff0090','#ff00a0','#ff00b0','#ff00c0','#ff00d0','#ff00e0','#ff00f0','#ff00ff','#ef00ff','#df00ff','#cf00ff','#bf00ff','#af00ff','#9f00ff','#8f00ff','#7f00ff','#6f00ff','#5f00ff','#4f00ff','#3f00ff','#2f00ff','#1f00ff'];

for(let i = 0; i<GridWidth; i++) { //Создание размеров сетки
    Grids[i] = new Array(GridHeight);
    for(let j=0; j<GridHeight; j++) {
        Grids[i][j] = 0;
        Grids[0][j] = 1;
    };
    Grids[i][0] = 1;
    Grids[i][GridHeight - 1] = 1;
};

for(let j=0; j<GridHeight; j++) {
    Grids[GridWidth-1][j] = 1;
};

function randomInteger(min, max) { //Рандомайзер случайных чисел
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
};

function drawGrids() { // Отрисовка сетки
    for(let i=0; i<GridWidth; i++) {
        for(let j=0; j<GridHeight; j++) {
            let GridX = (i * (sizeGrid)) + sizeGrid/10;
            let GridY = (j * (sizeGrid)) + sizeGrid/10;
            ctx.beginPath();
            ctx.rect(GridX, GridY, sizeGrid, sizeGrid);
            ctx.strokeStyle = "#000000";
            ctx.stroke();
            ctx.closePath();
        };
    };
};

class Foison{ //Еда или яд
    constructor(){
        this.X = randomInteger(1, GridWidth-2);
        this.Y = randomInteger(1, GridHeight-2);
        this.foodColour = "#008000"; //Цвет еды
        this.poisonColour = "#ff0000"; //Цвет яда
        this.state = randomInteger(0,1); // 0=яд, 1=еда
    }
    colour(){
        if(this.state == 0){
            Grids[this.X][this.Y] = 2;
            return this.poisonColour
        }
        else {
            Grids[this.X][this.Y] = 3;
            return this.foodColour;
        }
    }
    drawing() {
        ctx.beginPath();
        ctx.arc((this.X * sizeGrid) + (sizeGrid/10)*6 , (this.Y * sizeGrid)+ (sizeGrid/10)*6, (sizeGrid/10)*3, 0, Math.PI*2);
        ctx.fillStyle = this.colour();
        ctx.fill();
        ctx.closePath();
        drawGrids();
    };
};

let Fosions = new Array(FoodNumber);
for(let i = 0;i<Fosions.length;i++){
    Fosions[i] = new Foison();
    Fosions[i].drawing();
};

class Diod {
    constructor() {
        this.x = randomInteger(1, GridWidth - 2);
        this.y = randomInteger(2, GridHeight - 2);
        this.NowThink = 0;
        this.stopper = new Array(5);
        for(let i=0; i<this.stopper.length;i++){
            this.stopper[i] = 0;
        };
        this.health = 50;
        this.colour = 0;
        this.turn = new Array(8);//массив доступных направлений
        this.turn[0] = [0, -1];//В первое создание все диоды повёрнуты вверх
        this.turn[1] = [1, -1];
        this.turn[2] = [1, 0];
        this.turn[3] = [1, 1];
        this.turn[4] = [0, 1];
        this.turn[5] = [-1, 1];
        this.turn[6] = [-1, 0];
        this.turn[7] = [-1, -1];
        this.brain = new Array(64); //массив команд (мозг)
        for(let i = 0; i<this.brain.length;i++){
            this.brain[i] = randomInteger(0,63);
        };
        /*this.brain = [8,8,4,61,0,9,8,57,0,3,9,8,52,0,1,9,8,4,2,1,9,8,4,0,1,9,8,4,0,1,9,8,4,0,1,9,8,4,0,1,1,0,1,0,1,9,8,4,0,1,14,8,4,0,1,14,8,4,0,1,48,0,1,2];*/
    };
    clear(x, y) { //очистить клетку x,y
        ctx.beginPath();
        ctx.clearRect(x * sizeGrid + (sizeGrid/10), y * sizeGrid + (sizeGrid/10), sizeGrid, sizeGrid);
        ctx.closePath();
    };
    drawing() { //отрисовка нынешнего положения диода
        this.colour = this.colour%62;
        ctx.beginPath();
        ctx.rect(this.x * sizeGrid + sizeGrid/10, this.y * sizeGrid + sizeGrid/10, sizeGrid, sizeGrid);
        ctx.fillStyle = colours[this.colour];
        // ctx.rect(this.x * sizeGrid + sizeGrid/10, this.y * sizeGrid + sizeGrid/10, sizeGrid, sizeGrid);
        // ctx.fillStyle = colours[this.colour];
        ctx.fill();
        ctx.closePath();
        Grids[this.x][this.y] = 4;
        drawGrids();
    };
    Die(){
        this.clear(this.x,this.y);
        Grids[this.x][this.y] = 0;
    };
    grip(z) {//Схватить/преобразовать яд в еду
        let lookX = this.x + this.turn[z][0];
        let lookY = this.y + this.turn[z][1];
        this.Turning(z);
        if (((lookX < GridWidth) && (lookX >= 0)) && ((lookY >= 0) && (lookY < GridHeight))) {
            switch (Grids[lookX][lookY]) {
                case 0: //Пусто
                    this.NowThink += 5;
                    break;
                case 1: //Стена
                    this.NowThink += 2;
                    break;
                case 2: //Яд
                    for (let i = 0; i < Fosions.length; i++) {
                        if (Fosions[i].X == lookX && Fosions[i].Y == lookY) {
                            Fosions[i].state = 1;
                            Grids[lookX][lookY] = 3;
                            Fosions[i].drawing();
                            break;
                        };
                    };
                    this.NowThink += 1;
                    break;
                case 3: //Еда
                    this.health = this.health + 10;
                    for (let i = 0; i < Fosions.length; i++) {
                        if (Fosions[i].X == lookX && Fosions[i].Y == lookY) {
                            this.clear(lookX, lookY);
                            Fosions.splice(i,1);
                            Grids[lookX][lookY] = 0;
                            break;
                        };
                    };
                    this.NowThink += 4;
                    break;
                case 4: //Диод
                    this.NowThink += 3;
                    break;
            };
        };
    };

    Turning(z) { //Поворот (Изменение массива доступных направлений относительно поворота Диода)
        if (this.health > 0) {
            for (let i = 1; i <= z; i++) {
                let k = this.turn[0];
                for (let j = 0; j < 7; j++) {
                    this.turn[j] = this.turn[j + 1];
                };
                this.turn[7] = k;
            };
            this.health -= 1;
        };
        this.NowThink += 1;
    };

    Survey(z) { // Осмотр
        let lookX = this.x + this.turn[z][0];
        let lookY = this.y + this.turn[z][1];
        if (((lookX < GridWidth) && (lookX >= 0)) && ((lookY >= 0) && (lookY < GridHeight))){
            switch (Grids[lookX][lookY]) {
                case 0: //Пусто
                    this.NowThink += 5;
                    this.Turning(z);
                    break;
                case 1: //Стена
                    this.NowThink += 2;
                    this.Turning(z);
                    break;
                case 2: //Яд
                    this.NowThink += 1;
                    this.Turning(z);
                    break;
                case 3: //Еда
                    this.NowThink += 4;
                    this.Turning(z);
                    break;
                case 4: //Диод
                    this.NowThink += 3;
                    this.Turning(z);
                    break;
            };
        };
    };

    Moving(z) { // Движение ←↑→↓
        let newX = this.x + this.turn[z][0];
        let newY = this.y + this.turn[z][1];
        if (((newX < GridWidth) && (newX >= 0)) && ((newY >= 0) && (newY < GridHeight))) {
            this.Turning(z);
            if (this.health > 0) {
                switch (Grids[newX][newY]) {
                    case 0: //Пусто
                        Grids[this.x][this.y] = 0;
                        Grids[newX][newY] = 4;
                        this.clear(this.x, this.y);
                        this.x = newX;
                        this.y = newY;
                        this.drawing();
                        this.NowThink +=5;
                        break;
                    case 1://Стена
                        this.NowThink +=2;
                        break;
                    case 2://Яд
                        this.health = 0;
                        this.clear(newX, newY);
                        this.NowThink +=1;
                        for (let i = 0; i < Fosions.length; i++) {
                            if (Fosions[i].X == newX && Fosions[i].Y == newY) {
                                Fosions.splice(i,1);
                                break;
                            };
                        };
                        break;
                    case 3: //Еда
                        this.health = this.health + 10;
                        this.clear(this.x, this.y);
                        Grids[this.x][this.y] = 0;
                        this.x = newX;
                        this.y = newY;
                        this.drawing();
                        Grids[newX][newY] = 4;
                        this.NowThink +=4;
                        for (let i = 0; i < Fosions.length; i++) {
                            if (Fosions[i].X == newX && Fosions[i].Y == newY) {
                                Fosions.splice(i,1);
                                break;
                            };
                        };
                    case 4://Диод
                        this.NowThink +=3;
                        break;
                        break;
                };
            };
        };
    };
    Thinking(){
        if(this.NowThink>=64){//Остаёмся в пределах набора команд
            this.NowThink = this.NowThink%64;
        };
        let think = this.NowThink;
        let look = (this.brain[think] - (this.brain[think])%8)/8;//Ищем какая команда соответствует значению мозга
        switch (look) {
            case 0://Шаг
                this.stopper[0] = 0;
                this.Moving(this.brain[think]%8);
                this.stopper[0] +=1;
                break;
            case 1://Схватить
                this.stopper[1] = 0;
                this.grip(this.brain[think]%8);
                this.stopper[1] +=1;
                break;
            case 2://Посмотреть
                this.stopper[2] = 0;
                this.Survey(this.brain[think]%8);
                this.stopper[2] +=1;
            case 3://Повернуться
                this.stopper[3] = 0;
                this.Turning(this.brain[think]%8);
                this.stopper[3] +=1;
                break;
            default://Безусловный переход
                this.NowThink +=this.brain[think];
                this.stopper[4] +=1;
        };
            if (this.stopper[4] >= 20) {
                this.NowThink += 1;
                this.stopper[4] = 0;
            };
    };
};
let Diods = new Array(DiodNumber);

for(let i = 0;i<DiodNumber;i++){
    Diods[i] = new Diod();
    Diods[i].drawing();
};

function Start(){
    era = 0;
    setInterval(function () {
        for(let i = 0;i<Diods.length;i++) {//проверяем наличие здоровья у диода
            if (Diods[i].health > 0){
                Diods[i].Thinking();
            }else{
                Diods[i].Die();
                Diods.splice(i,1);
            };
        };
        if(Fosions.length < FoodNumber){ //восстанавливаем еду/яд до начального количества при поедании
            let terr = FoodNumber - Fosions.length;
            for(let i=0;i<terr;i++){
                let k = new Foison();
                Fosions.push(k);
                for(let i=0;i<Fosions.length;i++){
                    Fosions[i].drawing();
                };
            };
        };
        let m = randomInteger(0,1);// Вероятность мутации 1/2
        let a = new Diod();
        a.brain = Diods[0].brain;
        a.colour = Diods[0].colour;
        if(m == 0){
            a.brain[randomInteger(0,63)] = randomInteger(0,63);
            a.colour =a.colour+1;
        };
        if(Diods.length<DiodNumber) {
            Diods.push(a);
            era += 1;
            if(era%DiodNumber == 0){
                console.log('Эра', era/DiodNumber);
                for(let i=0;i<Diods.length;i++){console.log(i, Diods[i].colour);};
            };
            if(m == 0){
                console.log('mutation');
            };
        };
        drawGrids();
    },300);
};
Start();