//lorum ipsum dolor est etc etc
//todo: change the ugly concurrent loops into a finite state machine, maybe even make it fuzzy?
//
//this is the code my character Feriath usually uses

//begin character behavior vars
performance_trick()
var debug_mode = true
var attack_mode = true
var patrol_mode = true
var objective = "town"
var target_monster_type = "rat" //change me
var cdMulti = 1 //potion cooldown multiplier
var rangeFactor = 0.6
var burnMP = false


var patrolCoords = [ //yes, arrays are usually const and not var, however...
	[0,0], 
	[0,0], 
	[0,0], 
	[0,0], 
]
function doCircleKite(){ //really more of a square kite, rotated 45 degrees. We patrol clockwise around our current position to locations range * rangefactor away
	var pc = parent.character
	var dist = pc.range * rangeFactor
	draw_circle(pc.real_x,pc.real_y,dist) //show our client a circle centered on our initial position
	patrolCoords = [
		[pc.real_x,pc.real_y - dist], //to get a coordinate directly north of our position, subtract something from Y
		[pc.real_x + dist,pc.real_y], //for east, add to x
		[pc.real_x,pc.real_y + dist], //south +y
		[pc.real_x - dist,pc.real_y], //west -x
		]
}
/*
here's some funny code to figure out where exactly you are in the world and not deal with ugly decimals
game_log("X: " + Math.trunc(parent.character.real_x))
game_log("Y: " + Math.trunc(parent.character.real_y))
game_log("Map: " + parent.character.map)
*/
//blink from main map to spooky forest
//assuming you have mana and can cast spells of course
//use_skill("blink",[1600,-524])
//add some sort of delay here so blink finishes doing its thing...
//use_nearest_door()


//range with my current gear is 190 though yours may differ

const patrolLen = patrolCoords.length
var patrolPos = 0

//finite state machine objectives: town, scout, fight, rest, social?
/*
init
	learn things about us because we might not be Feriath!
town
	bank items?
	buy potions
	deposit gold
	buy alchables? lmao is it even ever worth it???
	upgrade armor?
	upgrade weapons?
	upgrade accesories?
	
scout
	determine viability of fighting monsters, maybe with some kind of way of asking what monsters we want to fight?
	starting with most valuable opponent...
	area clear of players who aren't in my party?
	next most valuable opponent...

fight
	the combat loop
	don't waste potions!

rest
	heal up, maybe retreat to a safe spot?
	don't waste potions!
	keep fighting or go to town?

error mode
	stop everything!
	alert user?
*/
/*
incomplete list of locations
x		y	map	mob name
-950 1630 main big crabs
-1300 315 main squigtoads	
-1180 470 squig center


todo: refactor these ugly loops into a finite state machine?
*/
doCircleKite()

setInterval(function patrolLoop(){
	if(!patrol_mode) return
	var coords = patrolCoords[patrolPos]
	var eps = 10 //epsilon aka "close enough"
	if(parent.character.real_x - eps <= coords[0] && coords[0] <= parent.character.real_x + eps && parent.character.real_y - eps <= coords[1] && coords[1] <= parent.character.real_y + eps) patrolPos++
	move(coords[0],coords[1])
	if(patrolPos >= patrolLen) patrolPos = 0
//	game_log(coords) //DEBUG
//	game_log(patrolPos) //DEBUG
//TODO: repeat only every dist / movespeed + ping correction?
},1000)

setInterval(function attackLoop(){
	if(!attack_mode || character.rip) return
	var target=get_targeted_monster();
	if(!target || target.mtype!=target_monster_type) target = get_nearest_monster({type:target_monster_type,no_target:true})
	if(target){
		attack(target)
		if(parent.character.mp*0.555 > target.hp && target.hp > parent.character.attack) use_skill("burst")
		if(parent.character.mp >= parent.character.max_mp * 0.9) use_skill("burst")
	}
		//Milliseconds per attack = 1 / (Attacks per second) * 1000
},parent.character.ping*3+1/parent.character.frequency*1000)

setInterval(function potionLoop(){
	var skun = "" //skill up next
	//perhaps add var for hp potion usage at health threshold here?
	if(parent.character.rip) return
	if(parent.character.mp <= parent.character.mp_cost) skun = "use_mp"
	else if(parent.character.hp <= 0.85*parent.character.max_hp) skun = "use_hp"
	else if(burnMP == true && parent.character.mp <= parent.character.max_mp - 500) skun = "use_mp"
	else if(parent.character.hp <= parent.character.max_hp - 400) skun = "use_hp"
	else if(parent.character.mp < parent.character.max_mp) skun = "regen_mp"
	else if(parent.character.hp < parent.character.max_hp) skun = "regen_hp"
	if(skun) use_skill(skun)
//	game_log(skun) //DEBUG
	if(skun.substr(0,3)=="use") cdMulti = 2
},2000*cdMulti + parent.character.ping*3);

setInterval(function lootLoop(){
loot() //there HAS to be a better way right?

},5000)
//	use_hp_or_mp();
//	loot();

function on_party_invite(name) { //okay okay Akura you can stop spamming invites because you think it's funny, I'll handle it I guess...
	if (name != "ArrowMcGee") return
	else accept_party_invite(name);
}


// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
// NOTE: If the tab isn't focused, browsers slow down the game
// NOTE: Use the performance_trick() function as a workaround