const start=Date.now();
while(Date.now()-start<60000){
 try{const response=await fetch('http://127.0.0.1:5175/demo');if(response.ok)process.exit(0);}catch{/* The server is still starting. */}
 await new Promise(resolve=>setTimeout(resolve,1000));
}
throw Error('Preview did not become ready in 60 seconds');
