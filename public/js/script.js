const socket = io('http://localhost:3000/nan_games/games/memory');
$(window).on('load',function(){
    $('#preloader').fadeOut(400);
});
let verifTab,tab,all,comptClick,DATAS, go = document.querySelector('#game .go'),comptScale,endGame = false;
const setData = (data) => {
    verifTab = [];
    tab = [];
    all = [];
    comptClick = false;
    DATAS = data;
};
const setBlockWhite = ()=>{
 $('.child').each(function(){
     $(this).css('background-color','white');
 });
};

const setBlock = (data) => {
        $('.cont').html('');
        set(data.nombre_case);
        $('.child').each(function(){
            $(this).css('display','flex');
        });
};

const getRandomCase = (compt) => {
    all = document.querySelectorAll('.child');
    while (compt > 0) {
        let number = Math.floor(Math.random() * all.length);
        while (tab.includes(number)) {
            number = Math.floor(Math.random() * all.length);
        }
        tab.push(number);
        compt--;
    }
};

const setRandomCase = (compt,data) => {
    console.log(compt);
    console.log(tab[compt]);
    let int = setInterval(() => {
        all[tab[compt]].style.backgroundColor = 'blue';
        compt++;
        if (compt === tab.length) {
            clearInterval(int);
            let awaitime = 3;
            let Await = setInterval(() => {
                awaitime--;
                if (awaitime === 0) {
                    clearInterval(Await);
                    for (let i = 0; i < tab.length; i++) {
                        all[tab[i]].style.backgroundColor = 'white';
                        comptClick = true;
                    }
                    aff()
                }
            }, data.temps_transition);
        }
    }, data.temps_affichage);
};


const reproduceEventByUser = () =>{
    for (let i = 0; i < all.length; i++) {
        all[i].addEventListener('click', () => {
            if (comptClick) {
                all[i].style.backgroundColor = "grey";
                verifTab.push(i);
                if (verifTab.length === tab.length) {
                    comptClick = false;
                    document.querySelector('.validate').click();
                }
            }
        });
    }
};

const Game = (DATAS) => {
    if(!endGame){
        setData(DATAS);
        let c = 2;
        const int = setInterval(()=>{
            c--;
            if(c === 1){
                setBlock(DATAS);
            }
            if(c === 0){
                clearInterval(int);
                $('#preloader').fadeOut(400);
                let compt = DATAS.case_visible;
                getRandomCase(compt);
                compt = 0;
                setRandomCase(compt,DATAS);
            }
        },500);
    }

};

const aff = () => {
    go.style.display = "block";
    comptScale = 0;
    const int2 = setInterval(()=>{
        comptScale+=1;
        let opa = window.getComputedStyle(go,null).opacity;
        go.style.opacity = (parseFloat(opa)-0.5).toString();
        go.style.transform = "scale("+comptScale+")";
        if(comptScale === 20){
            console.log(go.style.opacity);
            console.log(go.style.transform);
            clearInterval(int2);
            go.style.display = "none";
            go.style.opacity = "1";
            go.style.transform =  "scale(0)";
            reproduceEventByUser();
        }
    },20);
};

const ifIsMatch = (tab1, tab2,ordre) => {
    let verif = true;
    if(ordre){
        for (let i = 0; i < tab1.length; i++) {
            if (tab1[i] !== tab2[i]) {
                verif = false;
            }
        }
    }else{
        for (let i = 0; i < tab2.length; i++) {
            if(!tab1.includes(tab2[i])){
                verif = false;
            }
        }
    }
    return verif;

};

const afficheNiveau = (data)=>{
    setBlockWhite();
  $('#preloader h2').text("niveau "+data);
  $('#preloader p').text('');
  $('#preloader').fadeIn(400);
};

const getTime = (time) => {
    const timeTab = time.split(':');
    const Time = document.querySelector('.Time');
    Time.textContent = time;
    console.log(Time.textContent);
    let hour = parseInt(timeTab[0]),min = parseInt(timeTab[1]),sec = parseInt(timeTab[2]);
    if(hour > 0){
        const decompt = setInterval(()=>{
            sec--;
           if(sec === -1){
               sec = 59;
               min--
               if(min === -1){
                   min = 59;
                   hour--
                   if(hour === 0){
                       clearInterval(decompt);
                       alert('fini')
                       endGame = true
                   }
               }
           }
           Time.textContent = hour+":"+min+":"+sec;
        },1000);
    }else if(min > 0){
        const decompt = setInterval(()=>{
            sec--;
            if(sec === -1){
                sec = 59;
                min--
                if(min === 0){
                    clearInterval(decompt);
                    alert('fini');
                    endGame = true;
                }
            }
            Time.textContent = hour+":"+min+":"+sec
        },1000);
    }else{
        const decompt = setInterval(()=>{
            sec--;
            if(sec === 0){
                clearInterval(decompt);
                alert('fini')
                endGame = true
            }
            Time.textContent = hour+":"+min+":"+sec
        },1000);
    }
};

document.querySelector('.validate').addEventListener('click',()=>{
    console.log('je clique');
    if(!endGame){
        if (ifIsMatch(verifTab, tab, DATAS.ordre)) {
            for (let i = 0; i < tab.length; i++) {
                all[tab[i]].style.backgroundColor = 'lime';
            }
            let awaitime = 3;
            let Await = setInterval(() => {
                awaitime--;
                if (awaitime === 0) {
                    clearInterval(Await);
                    if(DATAS.niveau <= 18){
                        afficheNiveau(DATAS.niveau+1);
                        socket.emit('passlevel',DATAS.niveau)
                    }else{
                        alert('yes')
                    }
                }
            }, 500);
        } else {
            for (let i = 0; i < tab.length; i++) {
                all[verifTab[i]].style.backgroundColor = 'red';
            }
            let awaitime = 3;
            let Await = setInterval(() => {
                awaitime--;
                if (awaitime === 0) {
                    clearInterval(Await);
                    afficheNiveau(DATAS.niveau);
                    socket.emit('setTentative',DATAS.niveau)
                }
            }, 500);
        }
    }

    return false;
});



const set = (string) =>{
    const numberOfCase = eval(string);
    const firstNumber = parseInt(string.slice(0,string.indexOf('*')));
    const secondNumber = parseInt(string.slice(string.indexOf('*')+1,string.length));
    let width = 0,height = 0;
    if(firstNumber >= 2 && firstNumber <= 6){
        width =  150;
        height = 150;
    }else if((firstNumber >= 7 && firstNumber <= 10) && (secondNumber >= 1 && secondNumber <= 6)){
        width = 100;
        height = 100;
    }else if((firstNumber >= 7 && firstNumber <= 10) && (secondNumber >= 7 && secondNumber <= 10)){
        width = 85;
        height = 85;
    }else if(firstNumber >= 11 && firstNumber <= 15){
        width = 70;
        height = 70;
    }
    $('.cont').css('width',width * firstNumber+10+'px');
    $('.cont').css('height',height * secondNumber +10+'px');
    for(let i = 0; i < numberOfCase; i++){
        $('.cont').html($('.cont').html()+`<div class="child" style="width:${width}px;height:${height}px"></div>`);
    }
};

const button = document.querySelector('.welcome button');
button.addEventListener('click',()=>{
    document.querySelector('.welcome').style.display = "none";
    document.querySelector('.ombre').style.display = "none";
    afficheNiveau(1);
    socket.emit('begin_game_memory')
});

socket.on('gameInstance',(duree,data)=>{
    afficheNiveau(data.niveau);
    getTime(duree);
    Game(data)
});

socket.on('begin_game_memory',(duree,data)=>{
    getTime(duree);
    Game(data)
});

socket.on('passlevel',(data)=>{
    Game(data);
});

socket.on('setTentative',(data)=>{
    Game(data);
});