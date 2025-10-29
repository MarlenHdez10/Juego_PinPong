const canvas = document.getElementById('area');
const ctx = canvas.getContext('2d');

//variables imaagen
var img = new Image();
img.src = "img/estrellas.png";

//barra
ancho_barra = 20;
alto_barra = 100;
var posX_barra = 3;
var posY_barra = canvas.height / 2;
var pasos = 50;

//barra2
ancho_barra2 = 20;
alto_barra2 = 100;
var posX_barra2 = canvas.width-20;
var posY_barra2 =  canvas.height / 2;;
var pasos = 15;
var pausa = false; //barra 2

var MARGEN = 150;

var x = 50;
var y = canvas.height / 2;
var dx = 5;
var dy = -5;

var indice = 0;
var pelota_radio = 20;

var contador = 0;
var puntaje = 0;
var vidas = 3;
var nivel = 0;
const PUNTAJE_MAX = 25; 

let intervalo;

// Puntajes por nivel
const PUNTAJES = [4, 8, 12, 15,18];

let velocidad = 40;
let barra2_velocidad = 12;

var colores = ["#EE97E5","#267ed8","#e77d19ff","#53e719ff","#8141a7ff"];

//matriz de posiciones Moneda
let M = [
    [5,5,40,38,40,38], 
    [44,5,40,38,40,38],
    [80,5,33,38,33,38],
    [5,50,40,38,33,38],
    [34,50,40,38,40,38],
    [73,50,40,38,40,38]
]

//elemtos para poner en el paner del score
const scoreText = document.getElementById('score');
const maxText = document.getElementById('max');
const vidasText = document.getElementById('vidas');
const nivelText = document.getElementById('nivel');

//funciones para dibujar
function dibujarMoneda(){
    //dibujar la estrella con efecto
    ctx.drawImage(img,
        M[indice][0],  //coordenada X 
        M[indice][1], // Y
        M[indice][2], //ancho
        M[indice][3], //alto
        x, //sx
        y, //sy
        M[indice][3] / 2, //sW
        M[indice][3] / 2 //sH
        );

    indice = (indice + 1) % 6;
}

function dibujarBarra(){
    ctx.fillStyle = colores[nivel % colores.length]; // cambia el color con cada nivel
    //ctx.fillStyle = "#fffbfbff";
    ctx.fillRect(posX_barra,
        posY_barra,
        ancho_barra,
        alto_barra );
}

    function dibujarBarra2(){
        //ctx.fillStyle = "#fffbfbff";
         ctx.fillStyle = colores[nivel % colores.length];
        ctx.fillRect(posX_barra2,
            posY_barra2,
            ancho_barra2,
            alto_barra2); 
    }

function dibujarCancha(){
    ctx.fillStyle= "#051025";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    //dibujar la linea central
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([5, 15]); // Establece el patrón del trazo punteado
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height); 
    ctx.stroke();
    ctx.setLineDash([]); // Restablece el patrón del trazo
}

function dibujarJuego(){
    dibujarCancha();

    // Mostrar puntaje máximo
    // let maxPuntaje = localStorage.getItem("maxPuntaje") || 0;
    // ctx.font = "18px Arial";
    // ctx.fillStyle = "white";
    // ctx.fillText("Puntaje máximo: " + maxPuntaje, 350, 20);

    if(vidas === 0) {
        inicializar(); // Mostrar pantalla final
    }

    // Validar tope superior e inferior
    if(posY_barra2 < 0 || posY_barra2 + alto_barra2 > canvas.height){
        barra2_velocidad = -barra2_velocidad; 
    }

    dibujarMoneda();

    // ctx.font="18px Arial";
    // ctx.fillStyle="white";
    // ctx.fillText("Score:"+puntaje,500,20);
    // ctx.fillText("Vidas:"+vidas,70,20)
    // ctx.fillText("Nivel:"+nivel,220,20)
    x += dx;
    y += dy;
    detectar_colision_barra();

    if (x >= canvas.width-15 || x < 0) {
        dx = -dx; // Invertir la dirección
    }
 
    //limite de la pelota izq/der
    if (x >= canvas.width-15) {
        puntaje++; // Incrementar el puntaje cuando la pelota toque el límite derecho
        x >= canvas.width-15; // Evitar que la pelota se salga del límite derecho
    } else if (x < 0) {
        vidas--;
        dy = -dy; // Invertir la dirección horizontal al alcanzar los límites izquierdo
    }

    //limite de la pelota arriba/abajo
    if (y <= 0 || y > canvas.height - 20) {
        dy = -dy; // Invertir la dirección vertical al alcanzar los límites superior o inferior
        if (y <= 0) {
            y = 0; // Evitar que la pelota se salga del límite superior
        } else if (y > canvas.height - 20) {
            y = canvas.height - 20; // Evitar que la pelota se salga del límite inferior
        }
    }

    //barra 2 automática 
    posY_barra2 = y - MARGEN;

    //Validar que no se salga de los límites
    if(posY_barra2 < 0) {
        posY_barra2 = 0;
    }
    if(posY_barra2 + alto_barra2 > canvas.height){
        posY_barra2 = canvas.height - alto_barra2;
    }

    dibujarBarra();
    dibujarBarra2();
    aumentarVelocidad();
    verificarNivel();
    verificarVidas();
    contador++;
    terminar();
    actualizarPanel();
    
}

function inicializar(){
        dx = 0;
        dy = 0;
        posX_barra = canvas.width-795;
        posY_barra = (canvas.height/2)-80;
        dibujarBarra();
        dibujarBarra2();
        x = posX_barra + 40;
        y = posY_barra + 40;
        dibujarBarra2();
}

//carga la imagen y despues ejecuta la funcion 
img.onload = function (){ 
    intervalo = setInterval(dibujarJuego, velocidad);
}


document.addEventListener("keydown",detectarTecla);

function detectarTecla(e){
    if (e.keyCode == 38){
        //console.log("Avanzando a derecha")
        avance_barraY = -1 * pasos;
    }
    if (e.keyCode == 40){
        //console.log("Avanzando a izquierda")
        avance_barraY = 1 * pasos;
    }
    //console.log(posX_barra)

    if (avance_barraY == -1 * pasos && !(posY_barra < 11))   
            posY_barra += avance_barraY;
    else{
        if(avance_barraY == 1 * pasos && !(posY_barra > canvas.height - alto_barra -11))
            posY_barra += avance_barraY;
    }

    //pausa
    if (e.keyCode == 32){
        pausa = !pausa;
        if(pausa && nivel<=5){
            clearInterval(intervalo);
            ctx.font = "50px Arial";
            ctx.fillStyle = "RED";
            ctx.fillText("PAUSA", 200, 300);
        }else{
            intervalo = setInterval(dibujarJuego, velocidad);
        }
    }
    if (e.keyCode === 82) { 
        window.location.reload(); // Recarga la página
    }
}

function detectar_colision_barra() {
    console.log("X:", x); 
    console.log("Y:", y);
    console.log("pos_x_barra:", posX_barra);
    console.log("pos_y_barra:", posY_barra);

        

    // Colisión con la barra 1
    if (x + pelota_radio >= posX_barra-25 && x - pelota_radio <= posX_barra + ancho_barra-25 &&
        y + pelota_radio >= posY_barra-2 && y - pelota_radio <= posY_barra + alto_barra-2) {
        sonidoRebote();
        if (Math.random() > 0.5) {
            dx = -dx + (Math.random() * 2 - 1); // Cambia la dirección horizontal
        } else {
            dx = -dx;
        }
        if (Math.random() > 0.5) {
            dy = -dy + (Math.random() * 2 - 1); // Cambia la dirección horizontal
        } else {
            dy = -dy;
        }
    }

    // Colisión con la barra 2
    if (x - pelota_radio <= posX_barra2 + ancho_barra2 && x + pelota_radio >= posX_barra2 &&
        y - pelota_radio <= posY_barra2 + alto_barra2-30 && y + pelota_radio >= posY_barra2-30) {
         sonidoRebote();
        if (Math.random() > 0.5) {
            dx = -dx + (Math.random() * 2 - 1); // Cambia la dirección horizontal
        } else {
            dx = -dx;
        }
        if (Math.random() > 0.5) {
           dy = -dy + (Math.random() * 2 - 1); // Cambia la dirección horizontal
        } else {
            dy = -dy;
        }
    }
}

// Función para aumentar velocidad

function aumentarVelocidad() {
    if(nivel==1){
        velocidad=30;
        MARGEN=140;
        alto_barra=80;
    }if(nivel==2){
        velocidad=20;
        MARGEN=130;
        alto_barra=80;
    }if(nivel==3){
        velocidad=15;
        MARGEN=120;
        alto_barra=70;
    }if(nivel==4){
        velocidad=10;
        MARGEN=100;
        alto_barra=70;
    }if(nivel==5){
        velocidad=5;
        MARGEN=110; 
        alto_barra=50; 
    }
}

function verificarNivel(){
    // Cambio de nivel
    if(puntaje >= PUNTAJES[nivel]) {
    nivel++;
    aumentarVelocidad(); 
    clearInterval(intervalo); 
    intervalo = setInterval(dibujarJuego, velocidad);
    console.log(velocidad);
    }   
}

function verificarVidas(){
    if(vidas <= 0){
        sonidoPerder();
        clearInterval(intervalo);
        ctx.font = "18px Arial";
        ctx.fillStyle = "#dbf73fff";
        ctx.fillText("¡PERDISTE! Te has acabado tus vidas.", 120, 300);
    }
}

function actualizarPanel() {
  scoreText.textContent = puntaje;
  vidasText.textContent = vidas;
  nivelText.textContent = nivel;
  maxText.textContent = localStorage.getItem("maxPuntaje") || 0;
}

function terminar(){
    if(puntaje >= PUNTAJE_MAX) {
        sonidoGanar();
        clearInterval(intervalo); // detener animación
        ctx.font = "18px Arial";
        ctx.fillStyle = "Orange";
        ctx.fillText("¡GANASTE!,has alcanzado la puntuación máxima.", 100, 300);
    }
    //mostrar el punrtaje máximo
    let maxPuntaje = localStorage.getItem("maxPuntaje") || 0; //intenta leer la clave "maxPuntaje" desde el almacenamiento local del navegador.(strings)
    if (puntaje > maxPuntaje) {
        localStorage.setItem("maxPuntaje", puntaje); //guardar puntaje
    }
}


//efectos sonido
function sonidoRebote() {
  const ctxAudio = new (window.AudioContext || window.webkitAudioContext)(); //crea contexto de audio 
  const o = ctxAudio.createOscillator(); //genera ondas
  const g = ctxAudio.createGain(); //controla el volumen del sanido (nodo)
  o.connect(g); //conecta el oscilador y el nodo
  g.connect(ctxAudio.destination);//conecta a los altavoces
  o.type = "square"; //define el tipo de onda
  o.frequency.setValueAtTime(600, ctxAudio.currentTime); 
  o.frequency.exponentialRampToValueAtTime(200, ctxAudio.currentTime + 0.2); //Hace que la frecuencia baje de 600 a 200 Hz en 0.2 segundos, creando un efecto de “rebote descendente”.
  g.gain.setValueAtTime(0.2, ctxAudio.currentTime); //vol inicial
  g.gain.exponentialRampToValueAtTime(0.001, ctxAudio.currentTime + 0.2); //baja vol
  o.start();
  o.stop(ctxAudio.currentTime + 0.2);
}

function sonidoPerder() {
  const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctxAudio.createOscillator();
  const g = ctxAudio.createGain();
  o.connect(g);
  g.connect(ctxAudio.destination);
  o.type = "sawtooth";  //Onda triangular ascendente, sonido más “triste” o de error.
  o.frequency.setValueAtTime(300, ctxAudio.currentTime);
  o.frequency.exponentialRampToValueAtTime(50, ctxAudio.currentTime + 0.5);
  g.gain.setValueAtTime(0.2, ctxAudio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctxAudio.currentTime + 0.5);
  o.start();
  o.stop(ctxAudio.currentTime + 0.5);
}

function sonidoGanar() {
  const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctxAudio.createOscillator();
  const g = ctxAudio.createGain();
  o.connect(g);
  g.connect(ctxAudio.destination);
  o.type = "triangle";  //Onda triangular, sonido más “alegre” o musical.
  o.frequency.setValueAtTime(400, ctxAudio.currentTime);
  o.frequency.linearRampToValueAtTime(800, ctxAudio.currentTime + 0.2);
  g.gain.setValueAtTime(0.3, ctxAudio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctxAudio.currentTime + 0.3);
  o.start();
  o.stop(ctxAudio.currentTime + 0.3);
}
