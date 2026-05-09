
let score;
const GradingSystem=()=>{

if(score>70 && score<=100){
 return 'Excellent';
}
else if(score>60 && score<=69){
 return 'Very Good';
}
else if(score>50 && score<=59){
    return 'Good';
}
else if(score>40 && score<=49){
    return 'Poor';
}
else if(score>=0 && score<=39){
    return 'Very Poor';
}
else{
    return 'Invalid Score';
}
}

score=95;
console.log(GradingSystem());