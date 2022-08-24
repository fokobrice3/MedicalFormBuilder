//Nodes modules
const { EnapsoGraphDBClient } = require("@innotrade/enapso-graphdb-client");
const path = require('path');
var express = require("express"), 
    app = express(), 
    bodyParser = require('body-parser'), 
    port = 3000; 

    app.use(express.static(path.join(__dirname, 'public')));  
    app.use(express.urlencoded({ extended: true }));

// Configuration sur  wboDB | test_wbo
const GRAPHDB_BASE_URL = "http://localhost:7200",
    GRAPHDB_REPOSITORY = "test_wbo"
    GRAPHDB_USERNAME = "adminwbodb",
    GRAPHDB_PASSWORD = "adminwbodb",
    GRAPHDB_CONTEXT_TEST = "http://localhost:8080/WebBuilderOntology";
const DEFAULT_PREFIXES = [
    EnapsoGraphDBClient.PREFIX_OWL,
    EnapsoGraphDBClient.PREFIX_RDF,
    EnapsoGraphDBClient.PREFIX_RDFS,
    EnapsoGraphDBClient.PREFIX_XSD,
    EnapsoGraphDBClient.PREFIX_PROTONS,
    {
        prefix: "wbo",
        iri: "http://localhost:8080/WebBuilderOntology#",
    }
];

//Point d'accès à GraphDB
let graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
    baseURL: GRAPHDB_BASE_URL,
    repository: GRAPHDB_REPOSITORY,
    prefixes: DEFAULT_PREFIXES,
    tranform: 'toJSON' 
});

//Authentication
graphDBEndpoint.login(GRAPHDB_USERNAME,GRAPHDB_PASSWORD)
.then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err);
});

//Supprimer les Tags HTML des variables
function removeTags(str) {
  if ((str===null) || (str==='')) return false;
  else str = str.toString();        
  // Expression régulière pour identifier les balises HTML dans str.
  // Remplacer la balise HTML identifiée par une chaîne nulle.
  return str.replace( /(<([^>]+)>)/ig, '');
} 
 
//Save Form in GraphDB
app.post('/save_form', function(req, res){     
      //console.log(req.body); 
  //IRI creation
  const d = new Date();
  let ms = d.valueOf();
  const form_custom_iri ="Form"+ms;
  var str = String(req.body.form_json); 
  var form_data = str.replaceAll('"','\\"'); 
  //Génération de la requette complete
  var form_desc = ""+req.body.formDesc.replace(/\n/g, "<br>");//vider le textarea des \n
  var query = `insert data { 
    wbo:`+form_custom_iri+` rdf:type wbo:Form ;
      rdf:type owl:NamedIndividual ;
      rdfs:label "`+String(req.body.formTitle)+`" ;
      wbo:formTitle "`+String(req.body.formTitle)+`" ;
      wbo:formDesc "`+form_desc+`" ; 
      wbo:json_format "`+form_data+`" .`;  
  //Creation de chaque noeud du formulaire et rajout dans la requette
  var form_json = JSON.parse(String(req.body.form_json));
  for (i=0;i<form_json.length;i++){
    var Field_data = JSON.stringify(form_json[i]).replaceAll('"','\\"'); 
    if(form_json[i].type=="text"){ 
      if(form_json[i].subtype=="text"){       
        var Field_iri ="TextInput"+ms+"_"+i;
        query += `
        wbo:`+form_custom_iri+` wbo:hasTextInput wbo:`+Field_iri+` .
        wbo:`+Field_iri+` rdf:type wbo:TextInput ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].label)+`" ;
          wbo:name "`+form_json[i].name+`" ;                 
          wbo:value "`+form_json[i].value+`" ;
          wbo:json_format "`+Field_data+`" .`;        
      }else if(form_json[i].subtype=="password"){
        var Field_iri ="PasswordInput"+ms+"_"+i;  
        query += `
        wbo:`+form_custom_iri+` wbo:hasPasswordInput wbo:`+Field_iri+` .
        wbo:`+Field_iri+` rdf:type wbo:PasswordInput ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].label)+`" ;
          wbo:name "`+form_json[i].name+`" ;                 
          wbo:value "`+form_json[i].value+`" ;
          wbo:json_format "`+Field_data+`" .`;   
      }else if(form_json[i].subtype=="email"){
        var Field_iri ="EmailInput"+ms+"_"+i;
        query += `
        wbo:`+form_custom_iri+` wbo:hasEmailInput wbo:`+Field_iri+` .
        wbo:`+Field_iri+` rdf:type wbo:EmailInput ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].label)+`" ;
          wbo:name "`+form_json[i].name+`" ;                 
          wbo:value "`+form_json[i].value+`" ;
          wbo:json_format "`+Field_data+`" .`;           
      }else if(form_json[i].subtype=="date"){
        var Field_iri ="DateInput"+ms+"_"+i; 
        query += `
        wbo:`+form_custom_iri+` wbo:hasDateInput wbo:`+Field_iri+` .
        wbo:`+Field_iri+` rdf:type wbo:DateInput ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].label)+`" ;
          wbo:name "`+form_json[i].name+`" ;                 
          wbo:value "`+form_json[i].value+`" ;
          wbo:json_format "`+Field_data+`" .`; 
      }else if(form_json[i].subtype=="color"){
        var Field_iri ="ColorInput"+ms+"_"+i; 
        query += `
        wbo:`+form_custom_iri+` wbo:hasColorInput wbo:`+Field_iri+` .
        wbo:`+Field_iri+` rdf:type wbo:ColorInput ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].label)+`" ;
          wbo:name "`+form_json[i].name+`" ;                 
          wbo:value "`+form_json[i].value+`" ;
          wbo:json_format "`+Field_data+`" .`; 
      }else if(form_json[i].subtype=="datetime-local"){
        var Field_iri ="DateTimeInput"+ms+"_"+i;   
        query += `
        wbo:`+form_custom_iri+` wbo:hasDateTimeInput wbo:`+Field_iri+` .
        wbo:`+Field_iri+` rdf:type wbo:DateTimeInput ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].label)+`" ;
          wbo:name "`+form_json[i].name+`" ;                 
          wbo:value "`+form_json[i].value+`" ;
          wbo:json_format "`+Field_data+`" .`;
      }else  console.log(form_json[i].type+"(text) non identifié");
    }else if(form_json[i].type=="number"){
      var Field_iri ="NumberInput"+ms+"_"+i;  
      query += `
      wbo:`+form_custom_iri+` wbo:hasNumberInput wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:NumberInput ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;                 
        wbo:value "`+form_json[i].value+`" ;
        wbo:json_format "`+Field_data+`" .`;  
    }else if(form_json[i].type=="checkbox-group"){
      var Field_iri ="CheckboxInput"+ms+"_"+i;  
      query += `
      wbo:`+form_custom_iri+` wbo:hasCheckboxInput wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:CheckboxInput ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;        
        wbo:json_format "`+Field_data+`" .`; 
      for(var j=0;j<form_json[i].values.length;j++){
          var Option_iri ="OptionInput"+ms+"_"+j;  
          query += `
          wbo:`+Field_iri+` wbo:hasOption wbo:`+Option_iri+` .
          wbo:`+Option_iri+` rdf:type wbo:Option ;
            rdf:type owl:NamedIndividual ;
            rdfs:label "`+removeTags(form_json[i].values[j].label)+`" ;          
            wbo:value "`+form_json[i].values[j].value+`" .`;
      }  
    }else if(form_json[i].type=="select"){
      var Field_iri ="SelectInput"+ms+"_"+i;  
      query += `
      wbo:`+form_custom_iri+` wbo:hasSelectInput wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:Select ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;     
        wbo:json_format "`+Field_data+`" .`;   
      for(var j=0;j<form_json[i].values.length;j++){
        var Option_iri ="OptionInput"+ms+"_"+j;  
        query += `
        wbo:`+Field_iri+` wbo:hasOption wbo:`+Option_iri+` .
        wbo:`+Option_iri+` rdf:type wbo:Option ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].values[j].label)+`" ;          
          wbo:value "`+form_json[i].values[j].value+`" .`;
      }
    }else if(form_json[i].type=="radio-group"){
      var Field_iri ="RadioInput"+ms+"_"+i;  
      query += `
      wbo:`+form_custom_iri+` wbo:hasRadioInput wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:RadioInput ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;      
        wbo:json_format "`+Field_data+`" .`;   
      for(var j=0;j<form_json[i].values.length;j++){
        var Option_iri ="OptionInput"+ms+"_"+j;  
        query += `
        wbo:`+Field_iri+` wbo:hasOption wbo:`+Option_iri+` .
        wbo:`+Option_iri+` rdf:type wbo:Option ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].values[j].label)+`" ;          
          wbo:value "`+form_json[i].values[j].value+`" .`;
      } 
    }else if(form_json[i].type=="textarea"){
      var Field_iri ="Textarea"+ms+"_"+i; 
      query += `
      wbo:`+form_custom_iri+` wbo:hasTextarea wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:Textarea ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;                 
        wbo:value "`+form_json[i].value+`" ;
        wbo:json_format "`+Field_data+`" .`; 
    }else if(form_json[i].type=="button"){
      var Field_iri ="button"+ms+"_"+i;   
      query += `
      wbo:`+form_custom_iri+` wbo:hasButton wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:ButtonInput ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;                 
        wbo:value "`+form_json[i].value+`" ;
        wbo:json_format "`+Field_data+`" .`; 
    }else if(form_json[i].type=="header"){ 
      var Field_iri ="Header"+ms+"_"+i;
      if(form_json[i].subtype=="h1"){ var th ="heading1"; var ty="H1"}
      else if(form_json[i].subtype=="h2"){ var th ="heading2"; var ty="H2"}
      else if(form_json[i].subtype=="h3"){ var th ="heading3"; var ty="H3" }       
      else if(form_json[i].subtype=="h4"){ var th ="heading4"; var ty="H4" }
      else if(form_json[i].subtype=="h5"){ var th ="heading5"; var ty="H5" }
      else { var th ="heading6"; var ty="H6" }
      query += `
      wbo:`+form_custom_iri+` wbo:`+th+` wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:`+ty+` ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;        
        wbo:json_format "`+Field_data+`" .`;
    }else if(form_json[i].type=="paragraph"){
      var Field_iri ="Paragraph"+ms+"_"+i;   
      query += `
      wbo:`+form_custom_iri+` wbo:hasParagraph wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:Paragraph ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;         
        wbo:json_format "`+Field_data+`" .`;
    }else{
      console.log(form_json[i].type+"est non identifié");
    }
  }  
  //Fermeture de la requete SPARQL construite  
  query += ` }`;
  console.log(query);
  graphDBEndpoint
        .update(''+query
        ).then((result) => {  
            console.log("Requette Insertion :\n" + JSON.stringify(result, null, 2));
        }).catch((err) => {
            console.log(err);
  }); 
});

//Mise à jour Formulaire GraphDB
app.post('/update_form', function(req, res){
  const d = new Date();
  let ms = d.valueOf();
  const form_uri ="<"+req.body.uri+">";       
  var str = String(req.body.form_json); 
  var form_data = str.replaceAll('"','\\"');   
  var form_desc = ""+req.body.formDesc.replace(/\n/g, "<br>");
  //Génération Requete mis à jour
  var query = `DELETE {?s ?p ?o}
  INSERT {?s rdf:type wbo:Form ;
    rdf:type owl:NamedIndividual ;
    rdfs:label "`+String(req.body.formTitle)+`" ;
    wbo:formTitle "`+String(req.body.formTitle)+`" ;
    wbo:formDesc "`+form_desc+`" ;
    wbo:json_format "`+form_data+`" .`;   
  var form_json = JSON.parse(String(req.body.form_json));
  for (i=0;i<form_json.length;i++){
    var Field_data = JSON.stringify(form_json[i]).replaceAll('"','\\"'); 
    if(form_json[i].type=="text"){ 
      if(form_json[i].subtype=="text"){       
        var Field_iri ="TextInput"+ms+"_"+i;
        query += `
        `+form_uri+` wbo:hasTextInput wbo:`+Field_iri+` .
        wbo:`+Field_iri+` rdf:type wbo:TextInput ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].label)+`" ;
          wbo:name "`+form_json[i].name+`" ;                 
          wbo:value "`+form_json[i].value+`" ;
          wbo:json_format "`+Field_data+`" .`;        
      }else if(form_json[i].subtype=="password"){
        var Field_iri ="PasswordInput"+ms+"_"+i;  
        query += `
        `+form_uri+` wbo:hasPasswordInput wbo:`+Field_iri+` .
        wbo:`+Field_iri+` rdf:type wbo:PasswordInput ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].label)+`" ;
          wbo:name "`+form_json[i].name+`" ;                 
          wbo:value "`+form_json[i].value+`" ;
          wbo:json_format "`+Field_data+`" .`;   
      }else if(form_json[i].subtype=="email"){
        var Field_iri ="EmailInput"+ms+"_"+i;
        query += `
        `+form_uri+` wbo:hasEmailInput wbo:`+Field_iri+` .
        wbo:`+Field_iri+` rdf:type wbo:EmailInput ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].label)+`" ;
          wbo:name "`+form_json[i].name+`" ;                 
          wbo:value "`+form_json[i].value+`" ;
          wbo:json_format "`+Field_data+`" .`;           
      }else if(form_json[i].subtype=="date"){
        var Field_iri ="DateInput"+ms+"_"+i; 
        query += `
        `+form_uri+` wbo:hasDateInput wbo:`+Field_iri+` .
        wbo:`+Field_iri+` rdf:type wbo:DateInput ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].label)+`" ;
          wbo:name "`+form_json[i].name+`" ;                 
          wbo:value "`+form_json[i].value+`" ;
          wbo:json_format "`+Field_data+`" .`; 
      }else if(form_json[i].subtype=="color"){
        var Field_iri ="ColorInput"+ms+"_"+i; 
        query += `
        `+form_uri+` wbo:hasColorInput wbo:`+Field_iri+` .
        wbo:`+Field_iri+` rdf:type wbo:ColorInput ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].label)+`" ;
          wbo:name "`+form_json[i].name+`" ;                 
          wbo:value "`+form_json[i].value+`" ;
          wbo:json_format "`+Field_data+`" .`; 
      }else if(form_json[i].subtype=="datetime-local"){
        var Field_iri ="DateTimeInput"+ms+"_"+i;   
        query += `
        `+form_uri+` wbo:hasDateTimeInput wbo:`+Field_iri+` .
        wbo:`+Field_iri+` rdf:type wbo:DateTimeInput ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].label)+`" ;
          wbo:name "`+form_json[i].name+`" ;                 
          wbo:value "`+form_json[i].value+`" ;
          wbo:json_format "`+Field_data+`" .`;
      }else  console.log(form_json[i].type+"(text) non identifié");
    }else if(form_json[i].type=="number"){
      var Field_iri ="NumberInput"+ms+"_"+i;  
      query += `
      `+form_uri+` wbo:hasNumberInput wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:NumberInput ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;                 
        wbo:value "`+form_json[i].value+`" ;
        wbo:json_format "`+Field_data+`" .`;  
    }else if(form_json[i].type=="checkbox-group"){
      var Field_iri ="CheckboxInput"+ms+"_"+i;  
      query += `
      `+form_uri+` wbo:hasCheckboxInput wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:CheckboxInput ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;        
        wbo:json_format "`+Field_data+`" .`; 
      for(var j=0;j<form_json[i].values.length;j++){
          var Option_iri ="OptionInput"+ms+"_"+j;  
          query += `
          wbo:`+Field_iri+` wbo:hasOption wbo:`+Option_iri+` .
          wbo:`+Option_iri+` rdf:type wbo:Option ;
            rdf:type owl:NamedIndividual ;
            rdfs:label "`+removeTags(form_json[i].values[j].label)+`" ;          
            wbo:value "`+form_json[i].values[j].value+`" .`;
      }  
    }else if(form_json[i].type=="select"){
      var Field_iri ="SelectInput"+ms+"_"+i;  
      query += `
      `+form_uri+` wbo:hasSelectInput wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:Select ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;     
        wbo:json_format "`+Field_data+`" .`;   
      for(var j=0;j<form_json[i].values.length;j++){
        var Option_iri ="OptionInput"+ms+"_"+j;  
        query += `
        wbo:`+Field_iri+` wbo:hasOption wbo:`+Option_iri+` .
        wbo:`+Option_iri+` rdf:type wbo:Option ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].values[j].label)+`" ;          
          wbo:value "`+form_json[i].values[j].value+`" .`;
      }
    }else if(form_json[i].type=="radio-group"){
      var Field_iri ="RadioInput"+ms+"_"+i;  
      query += `
      `+form_uri+` wbo:hasRadioInput wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:RadioInput ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;      
        wbo:json_format "`+Field_data+`" .`;   
      for(var j=0;j<form_json[i].values.length;j++){
        var Option_iri ="OptionInput"+ms+"_"+j;  
        query += `
        wbo:`+Field_iri+` wbo:hasOption wbo:`+Option_iri+` .
        wbo:`+Option_iri+` rdf:type wbo:Option ;
          rdf:type owl:NamedIndividual ;
          rdfs:label "`+removeTags(form_json[i].values[j].label)+`" ;          
          wbo:value "`+form_json[i].values[j].value+`" .`;
      } 
    }else if(form_json[i].type=="textarea"){
      var Field_iri ="Textarea"+ms+"_"+i; 
      query += `
      `+form_uri+` wbo:hasTextarea wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:Textarea ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;                 
        wbo:value "`+form_json[i].value+`" ;
        wbo:json_format "`+Field_data+`" .`; 
    }else if(form_json[i].type=="button"){
      var Field_iri ="button"+ms+"_"+i;   
      query += `
      `+form_uri+` wbo:hasButton wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:ButtonInput ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;                 
        wbo:value "`+form_json[i].value+`" ;
        wbo:json_format "`+Field_data+`" .`; 
    }else if(form_json[i].type=="header"){ 
      var Field_iri ="Header"+ms+"_"+i;
      if(form_json[i].subtype=="h1"){ var th ="heading1"; var ty="H1"}
      else if(form_json[i].subtype=="h2"){ var th ="heading2"; var ty="H2"}
      else if(form_json[i].subtype=="h3"){ var th ="heading3"; var ty="H3" }       
      else if(form_json[i].subtype=="h4"){ var th ="heading4"; var ty="H4" }
      else if(form_json[i].subtype=="h5"){ var th ="heading5"; var ty="H5" }
      else { var th ="heading6"; var ty="H6" }
      query += `
      `+form_uri+` wbo:`+th+` wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:`+ty+` ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;        
        wbo:json_format "`+Field_data+`" .`;
    }else if(form_json[i].type=="paragraph"){
      var Field_iri ="Paragraph"+ms+"_"+i;   
      query += `
      `+form_uri+` wbo:hasParagraph wbo:`+Field_iri+` .
      wbo:`+Field_iri+` rdf:type wbo:Paragraph ;
        rdf:type owl:NamedIndividual ;
        rdfs:label "`+removeTags(form_json[i].label)+`" ;
        wbo:name "`+form_json[i].name+`" ;         
        wbo:json_format "`+Field_data+`" .`;
    }else{
      console.log(form_json[i].type+"est non identifié");
    }
  }   
  query += ` }WHERE{ ?s ?p ?o . 
    FILTER (?s = `+form_uri+`) 
  }`;
    console.log(query);
  graphDBEndpoint
        .update(''+query
        ).then((result) => {  
            console.log("Requette Update :\n" + JSON.stringify(result, null, 2));
        }).catch((err) => {
            console.log(err);
  });
});

//Obtenir tous les formulaires de Wbo GraphDB
app.post('/get_forms', function(req, res){ 
  graphDBEndpoint
        .query(
        `select ?form ?formTitle ?json ?formDesc where { 
          ?form rdf:type wbo:Form ;
             wbo:formTitle ?formTitle ;     
             wbo:json_format ?json ;  
             wbo:formDesc ?formDesc ;  
        }`)
        .then((result) => { 
            res.send(JSON.stringify(result, null, 2));
            //console.log("Get Forms Request \n" + JSON.stringify(result, null, 2));
        })
        .catch((err) => {
            console.log(err);
    }); 
}); 

//Obtenir un formulaire spécifique avec une chaîne uri à partir de Wbo GraphDB
app.post('/get_a_form', function(req, res){ 
  graphDBEndpoint
        .query(
        `select ?form ?formTitle ?json ?formDesc where {  
          ?form rdf:type wbo:Form;    
               rdf:type owl:NamedIndividual .
          OPTIONAL{
              ?form wbo:formTitle ?formTitle .
              ?form wbo:json_format ?json .
              ?form wbo:formDesc ?formDesc .
          }. 
          filter(?form=wbo:`+req.body.uri+`)
      }`)
        .then((result) => { 
            res.send(JSON.stringify(result, null, 2));
            //console.log("Get Forms Request \n" + JSON.stringify(result, null, 2));
        })
        .catch((err) => {
            console.log(err);
    });    
}); 

//Supprimer un formulaire
app.post('/delete_form', function(req, res){ 
      //console.log(req.body.iri); 
      //console.log(req.body.name); 
  //Suppresion de tous les triplets ou le formulaire est <sujet> 
  graphDBEndpoint
  .update(
    `delete {
			<`+req.body.iri+`> ?p ?o
		}where {
      <`+req.body.iri+`> ?p ?o
		}`
  ).then((result) => {
    console.log("Triplet store : <"+req.body.iri+"> ?p ?o Supprimés:\n" + JSON.stringify(result, null, 2));
  }).catch((err) => {
    console.log(err);
  });
  //Suppresion de tous les triplets ou le formulaire est <objet> 
  graphDBEndpoint
  .update(
    `delete {
			?s ?p <`+req.body.iri+`>
		}where {
      ?s ?p <`+req.body.iri+`>
		}`
  ).then((result) => {
    console.log("Triplet store : ?s ?p <"+req.body.iri+"> Supprimés:\n" + JSON.stringify(result, null, 2));
  }).catch((err) => {
    console.log(err);
  });
});

//Démarrage du serveur Node
app.listen(port); 
console.log("Serveur ouvert sur http://localhost:"+port); 
