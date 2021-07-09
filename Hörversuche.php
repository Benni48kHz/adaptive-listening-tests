<!DOCTYPE html>
<html lang="de">

<head>
   <?php readfile("./includes/head.html"); ?>
   <meta name="Description" content="3-AFC Hörversuch zur Bestimmung der Hörschwelle von nichtlinearen Verzerrungen" />
   <script src="ts/js/AudioContextMonkeyPatch.js"></script>
   <script type="module" src="ts/js/main.js"></script>
   <link rel='stylesheet' href='css/listeningTest.css' />
</head>

<body>

   <?php readfile("./includes/topbar.html"); ?>

   
   <nav id="navbar" class="navbar bg-light navbar-light navbar-expand-lg display-none">
      <div class="container col-10">

         <a href="index.html" class="navbar-brand">
            <img src="img/logo.png" alt="Lauxsprecher" title="Lauxsprecher"></img>
         </a>

         <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive">
            <span class="navbar-toggler-icon"></span>
         </button>

         <div class="collapse navbar-collapse" id="navbarResponsive">
            <ul class="navbar-nav ml-auto">
               <?php if (str_contains($_SERVER["SCRIPT_NAME"], "index.php")) : ?>
                  <li class="nav-item" aria-current="page"><a>Home</a></li>
               <?php else : ?>
                  <li class="nav-item"><a href="index.php" class="nav-link">Home</a></li>
               <?php endif; ?>

               <?php if (str_contains($_SERVER["SCRIPT_NAME"], "Produktpalette.php")) : ?>
                  <li class="nav-item" aria-current="page"><a>Produktpalette</a></li>
               <?php else : ?>
                  <li class="nav-item"><a href="Produktpalette.php" class="nav-link">Produktpalette</a></li>
               <?php endif; ?>

               <?php if (str_contains($_SERVER["SCRIPT_NAME"], "Hörversuche.php")) : ?>
                  <li class="nav-item" aria-current="page"><a>Hörversuche</a></li>
               <?php else : ?>
                  <li class="nav-item"><a href="Hörversuche.php" class="nav-link">Hörversuche</a></li>
               <?php endif; ?>

               <li class="nav-item"><a href="" class="nav-link">Kontakt</a></li>
            </ul>
         </div>
      </div>
   </nav>

   <div id="dropArea" ondragenter="event.stopPropagation(); event.preventDefault();" ondragover="event.stopPropagation(); event.preventDefault();" ondrop="event.stopPropagation(); event.preventDefault();">

      <p class="center-aligned-text">Audiodatei hierhin ziehen</p>

      <label for="fileUpload" class="custom-file-upload center-aligned-text">
         <i class="fa fa-cloud-upload"></i> Datei suchen
      </label>
      <input id="fileUpload" type="file" accept="audio/mpeg, audio/ogg, audio/wav, audio/*" />

      <div id="userFile" class="display-none">
         <img id="checkMark" src="img/listening-test/checkMark.png" alt="check" style="height: 1.8em;"/>
         <h5 id="fileName">asdfsad</h5>
      </div>

      <button class="center-aligned-text" id="start">
         <h2>Test starten</h2>
      </button>
   </div>


   <div id="loadingScreen">

      <h2 class="center-aligned-text">Bitte warten. Der Test wird in Kürze gestartet.</h2>

      <div id="floatingCirclesG">
         <div class="f_circleG" id="frotateG_01"></div>
         <div class="f_circleG" id="frotateG_02"></div>
         <div class="f_circleG" id="frotateG_03"></div>
         <div class="f_circleG" id="frotateG_04"></div>
         <div class="f_circleG" id="frotateG_05"></div>
         <div class="f_circleG" id="frotateG_06"></div>
         <div class="f_circleG" id="frotateG_07"></div>
         <div class="f_circleG" id="frotateG_08"></div>
      </div>
   </div>

   <!-- todo: inline css entfernen -->
   <div id="listeningTest">

      <div id="newTrial" class="center-aligned-text">
         <h2>Neue Runde!</h2>
      </div>

      <button id="enterNewTrial">
         <h2>Weiter</h2>
      </button>

      <article id="AFC">
         <div>
            <div class="choice" id="choiceA">
               <div class="column" id="columnA">
                  <img id="A" src="img/listening-test/A.png" style="width:100%" alt="A" />
               </div>
               <div id="thumbsA" class="column">
                  <img class="thumb" id="thumbUpA" src="img/listening-test/thumbs-transparent.png" alt="thumbUp" />
                  <img class="thumb" id="thumbDownA" src="img/listening-test/thumbs-transparent.png" alt="thumbDown" />
               </div>
            </div>
         </div>

         <div>
            <div class="choice" id="choiceB">
               <div class="column" id="columnB">
                  <img id="B" src="img/listening-test/B.png" style="width:100%" alt="B" />
               </div>
               <div id="thumbsB" class="column">
                  <img class="thumb" id="thumbUpB" src="img/listening-test/thumbs-transparent.png" alt="thumbUp" />
                  <img class="thumb" id="thumbDownB" src="img/listening-test/thumbs-transparent.png" alt="thumbDown" />
               </div>
            </div>
         </div>

         <div>
            <div class="choice" id="choiceC">
               <div class="column" id="columnC">
                  <img id="C" src="img/listening-test/C.png" style="width:100%" alt="" />
               </div>
               <div id="thumbsC" class="column">
                  <img class="thumb" id="thumbUpC" src="img/listening-test/thumbs-transparent.png" alt="thumbUp" />
                  <img class="thumb" id="thumbDownC" src="img/listening-test/thumbs-transparent.png" alt="thumbDown" />
               </div>
            </div>
         </div>
      </article>

      <h5 class="center-aligned-text" id="volumeLabel">Lautstärke</h5>
      <input type="range" id="volume" min="-40" max="0" value="-6" step="0.1" />

      <svg class="cursor-pointer" id="seekingBar" width="800" height="150" viewbox="0 -75 800 150"></svg>

      <p class="center-aligned-text" id="time">
         <span id="elapsedTime"></span> /
         <span id="duration"></span>
      </p>
      <br>

      <button id="audioPlayPause">
         <h2>Play</h2>
      </button>

      <button id="cancel">
         Abbrechen
      </button>

   </div>


   <div id="conclusion">
      <h5 class="center-aligned-text">
         Der in diesem Hörveruch erreichte Threshold beträgt:
      </h5>
      <br>
      <h4 class="center-aligned-text" id="threshold">
      </h4>
   </div>

</body>

</html>