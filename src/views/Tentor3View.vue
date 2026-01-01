<template>
  <div class="view-container">
    <h1 class="main-title">Korsord: Budgetering</h1>

    <div class="controls-row">
      <button @click="generateCrossword" class="action-btn">Generera nytt korsord</button>
      <button @click="checkAnswers" class="action-btn">Rätta</button>
      <button @click="revealAll" class="action-btn">Visa facit</button>
    </div>

    <div v-if="grid" class="crossword-layout">
      <div class="grid-wrapper">
        <div class="grid-container">
          <div v-for="(row, r) in grid" :key="r" class="grid-row">
            <div 
              v-for="(cell, c) in row" 
              :key="c" 
              class="cell" 
              :class="{ 
                'cell-block': !cell.char, 
                'cell-active': cell.char, 
                'cell-correct': cell.isCorrect,
                'cell-focused': focusedCell?.r === r && focusedCell?.c === c
              }"
              @click="cellClicked(r, c)"
            >
              <span v-if="cell.number" class="cell-number">{{ cell.number }}</span>
              
              <input 
                v-if="cell.char" 
                :id="`cell-${r}-${c}`"
                type="text" 
                maxlength="1" 
                v-model="cell.input"
                @input="(e) => handleInput(e, r, c)"
                @keydown="(e) => handleKeydown(e, r, c)"
                @focus="cellClicked(r, c)"
                :disabled="revealed"
                autocomplete="off"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="clues-container">
        <div class="clues-column">
          <h3 :class="{ 'active-clue-header': activeDirection === 'across' }">Vågrätt &rarr;</h3>
          <ul>
            <li v-for="clue in clues.across" :key="clue.number" :class="{ 'highlight-clue': isClueActive(clue.number, 'across') }">
              <strong>{{ clue.number }}.</strong> {{ clue.text }}
            </li>
            <li v-if="clues.across.length === 0" class="empty-msg">Inga vågräta ord.</li>
          </ul>
        </div>
        <div class="clues-column">
          <h3 :class="{ 'active-clue-header': activeDirection === 'down' }">Lodrätt &darr;</h3>
          <ul>
            <li v-for="clue in clues.down" :key="clue.number" :class="{ 'highlight-clue': isClueActive(clue.number, 'down') }">
              <strong>{{ clue.number }}.</strong> {{ clue.text }}
            </li>
            <li v-if="clues.down.length === 0" class="empty-msg">Inga lodräta ord.</li>
          </ul>
        </div>
      </div>
    </div>
    
    <p v-else class="loading-text">Genererar korsord...</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';

// --- DATA ---
const flashcardsData = [
  { front: "Företag", back: "Större sammanslutning personer som bedriver ett medvetet arbete för att uppnå ett mål." },
  { front: "Ekonomi", back: "Hushållning med begränsade resurser." },
  { front: "Företagsekonomi", back: "Läran om företags hushållning med begränsade resurser." },
  { front: "Ekonomistyrning", back: "Avsiktlig påverkan på en verksamhet och dess befattningshavare mot vissa ekonomiska mål." },
  { front: "Formaliserade styrmedel", back: "Styrmedel av metodkaraktär och utgör ekonomistyrningens tekniker, såsom : produktkalkylering, budgetering m.m." },
  { front: "Organisationsstruktur", back: "Innefattar aspekter på bla verksamhetens utformning, arbetets utförande, beslut, ansvar och personalstruktur." },
  { front: "Mindre formaliserade styrmedel", back: "Mjuka styrmedel, såsom företagskultur, lärande och medarbetarskap." },
  { front: "Vision", back: "Anger hur man vill att kunderna ska uppfatta företaget eller den riktning i vilken företaget ska utvecklas. Önskvärt framtida tillstånd." },
  { front: "Visionens tre funktioner", back: "Legitimerande, ambition & fokus samt identifikation & motivation." },
  { front: "Affärsidé", back: "Vad företaget ska ägna sig åt och hur man avser att utvecklas i förhållande till visionen. Klargörande av differentiering." },
  { front: "Strategi", back: "Klargör hur företaget ska arbeta. Plan för hur företagets affärsidé ska uppnås." },
  { front: "Verksamhetsplanering", back: "Nedbrytning av huvudmål till delmål och framtagande av handlingsplaner och riktlinjer." },
  { front: "Effektivitet", back: "Graden av måluppfyllelse och uttryck för i vilken utsträckning företaget uppnår ett mål. Värdet av utflöde / Värdet av inflöde = E" },
  { front: "Intäkt", back: "Värdet av en prestation som utförts under en viss period." },
  { front: "Kostnad", back: "Värdet av förbrukade resurser under en viss period." },
  { front: "Öppna systemsynsättet", back: "Man ser organisationen som en del av ett större ekosystem snarare än en sluten enhet." },
  { front: "Nuvärde", back: "Värdet idag" },
  { front: "Inre effektivitet", back: "Handlar om att göra saker rätt" },
  { front: "Yttre effektivitet", back: "Handlar om att göra rätt saker, rör företagets relationer till sin omvärld." },
  { front: "Produktivitet", back: "Vad som har åstadkommits och den resursinsats som satts in och de prestationer som utförts för att åstadkomma resultat uttrycks i fysiska termer, dvs i kvantiteter. Kvantitet utflöde / Kvantitet inflöde = P" },
  { front: "Inbetalning", back: "Inflöde av likvida medel." },
  { front: "Utbetalning", back: "Utflöde av likvida medel. Uppkommer när det köpande bolaget betalar för anskaffade resurser." },
  { front: "Inkomst", back: "Uppstår när ett företag säljer varor eller tjänster. När fakturan skickas." },
  { front: "Utgift", back: "Uppstår när ett företag anskaffar resurser genom köp av varor eller tjänster. När fakturan kommer." },
  { front: "Lönsamhet", back: "Ett kvotmått, ett relationstal. Resultat / Kapital = L" },
  { front: "Det vertikala perspektivet", back: "Företaget ses som en hierarki med under- och överordnade enheter. “Toppen styr” och ekonomistyrning är medlet vilket de överordnade enheterna kan kontrollera." },
  { front: "Det horisontella perspektivet", back: "Företag betraktas som en serie processer som in sin tur består av aktiviteter vilka syftar till att skapa kundvärde. Ekonomistyrningens uppgift är att länka samman processer och aktiviteter." },
  { front: "Lönsamhetsansvar", back: "Ansvaret ska svara mot ägarnas avkastningskrav. Enheten har såväl befogenhet som möjligheter att påverka de intäkter och kostnader och det kapital som ingår i ansvaret." },
  { front: "Resultatansvar", back: "Ansvar för att uppnå ett ekonomiskt resultat genom att påverka intäkter och kostnader, men utan fullt ansvar för kapitalbindning." },
  { front: "Intäkts- eller bidragsansvar", back: "Innebär att målsättningar och krav preciseras i termer av intäkter, dvs försäljning." },
  { front: "Kostnadsansvar", back: "Ansvar för att kontrollera och påverka kostnader." },
  { front: "Belöningssystem", back: "Används för att motivera anställda att uppnå organisationens må. Finns finansiella och icke-finansiella." },
  { front: "Företagskultur", back: "Organisationens inre liv, dvs sättet att leva, tänka, handla och vara." },
  { front: "Single-loop learning", back: "Innebär att när något oönskat inträffar så löser man det utan att gå till botten med orsaken till det inträffade." },
  { front: "Double-loop learning", back: "Innebär att såväl det oönskade löses som att ett ifrågasättande av själva orsaken till det inträffade äger rum." },
  { front: "Medarbetarskap", back: "Handlar om demokratisering av arbetslivet. Strategi för att öka engagemanget och viljan att göra ett bra jobb." },
  { front: "Kostnads- och nyttokriteriet", back: "Det centrala kriteriet som bör tillämpas vid val mellan metoder är deras nytta när det gäller att bidra till uppfyllandet av mål jämfört med kostnaden för metoderna." },
  { front: "Rörliga kostnader", back: "En kostnad vars totalsumma förändras kontinuerligt när verksamhetsvolymen förändras." },
  { front: "Fasta kostnader", back: "En kostnad vars totalsumma är oförändrad när verksamhetsvolymen förändras." },
  { front: "Verksamhetsvolym", back: "Oftast ett uttryck för företagets output, ex antalet producerade enheter." },
  { front: "Aktiviteter", back: "Olika slag av arbetsmoment." },
  { front: "Kostnadsdrivare", back: "Vad som driver på kostnaden." },
  { front: "Resultatplanering", back: "Studerar samband mellan intäkter, rörliga kostnader, fasta kostnader och volym." },
  { front: "Totalkostnad", back: "Summan av den rörliga och den fasta kostnaden." },
  { front: "Kritisk punkt", back: "Anger vid vilken volym och vid vilken total intäkt resultatet är 0 kr. Består av den kritiska volymen och den kritiska intäkten." },
  { front: "Säkerhetsmarginal", back: "Skillnaden mellan faktiska volymen och den kritiska volymen alt skillnaden mellan den faktiska intäkten och den kritiska totala intäkten." },
  { front: "Bidragsanalys", back: "Enklare variant av resultatplanering. Tittar på särintäkter och särkostnader för att beräkna täckningsbidrag." },
  { front: "Bidragslinje", back: "Linje som anger skillnaden mellan intäkter och rörliga kostnader vid olika volymer." },
  { front: "Täckningsgrad", back: "Anger hur stort täckningsbidraget är per styck eller totalt i förhållande till priset per styck respektive den totala intäkten. Det bidrag varje försäljningskrona ger i procent." },
  { front: "Produktkalkyl", back: "Sammanställning av intäkter och/eller kostnader i en viss kalkylsituation för ett visst kalkylobjekt." },
  { front: "Kalkylobjekt", back: "Det är “vad” kalkylen handlar om." },
  { front: "Kalkylsituationer", back: "De olika situationer i en organisation där en kalkyl behövs." },
  { front: "Relevanta ekonomiska konsekvenser", back: "Sådana som aktualiseras i den unika kalkylsituationen." },
  { front: "Kalkylmässiga kostnader", back: "De kostnader som inkluderas i produktkalkyleringen." },
  { front: "Bokföringsmässiga kostnader", back: "De faktiska kostnader som registreras i den externa redovisningen." },
  { front: "Bokföringsmässiga merkostnader", back: "Kostnader som endast finns i den externa redovisningen." },
  { front: "Kalkylmässiga merkostnader", back: "Kostnader som endast finns i kalkyleringen." },
  { front: "Nuanskaffningsvärden", back: "Kostnaden att skaffa en tillgång idag" },
  { front: "Periodisering", back: "Rör behandlingen av poster i tidsdimensionen" },
  { front: "Kapitalkostnader", back: "Består dels av kostnader för förbrukning (avskrivningar) och dels av den ersättning företagets finansiärer kräver på det kapital som de ställt till företagets förfogande, avkastning och räntekostnader." },
  { front: "Självkostnad", back: "Utgör summan av samtliga kostnader för en vara/tjänst/order till dess att den är utförd/fullgjord/levererad och betald." },
  { front: "Fullständig kostnadsfördelning", back: "Alla företagets kostnader allokeras till kalkylobjekt." },
  { front: "Kostnadsställe", back: "Kan utgöras av bla tillverkningsavsnitt, ansvarsområden och avdelningar." },
  { front: "Sysselsättningseffekten", back: "Sysselsättningseffekten är en nackdel med divisionsmetoden eftersom sysselsättningsnivån inte beaktas. Med metoden fördelas samtliga kostnader på verksamhetsvolym oavsett storlek. Det är vanligt att företag har variationer i sin sysselsättning mellan tidsperioder beroende på till exempel konjunktur- och säsongsvariationer." },
  { front: "Övertäckning av fasta kostnader", back: "Uppstår när ett företag producerar och säljer fler enheter än den \"normala\" volymen som ligger till grund för kalkylen, vilket leder till att en större del av de fasta kostnaderna fördelas per enhet och skapar ett överskott." },
  { front: "Undertäckning av fasta kostnader", back: "Företagets faktiska produktions- eller försäljningsvolym är lägre än den normala eller budgeterade volymen, vilket leder till att de fasta kostnaderna inte fullt ut täcks och därmed belastar resultatet tyngre per producerad enhet, och skapar en negativ avvikelse (minus) från vad som planerat i självkostnadskalkylen." },
  { front: "Ekvivalenttal", back: "Ekvivalenttal används för att ta hänsyn till skillnader i resurskrav mellan kalkylobjekt. Ekvivalenttal är vägnings-/relationstal som anger ett kalkylobjekts resursåtgång relativt andra inkluderade kalkylobjekt. Det visar på skillnaden i resursåtgång mellan de olika kalkylobjekten. För att räkna om volym i en enhet." },
  { front: "Ekvivalentvolym", back: "Ekvivalenttal x Volym per objekt" },
  { front: "Särkostnad", back: "Kostnader som orsakas av ett kalkylobjekt i en viss kalkylsituation." },
  { front: "Samkostnad", back: "Kostnader som orsakas gemensamt av två eller fler kalkylobjekt." },
  { front: "Direkt kostnad", back: "Kostnader som påförs kalkylobjekt direkt" },
  { front: "Omkostnad", back: "Kostnader som påförs kalkylobjekt via fördelning" },
  { front: "Pålägg", back: "Den kostnadsdel eller den vinstmarginal som läggs ovanpå en varas eller tjänsts direkta kostnad för att nå försäljningspriset, och det visar hur mycket som ska adderas till inköpspriset för att täcka alla omkostnader och ge önskad vinst, till skillnad från marginal som är vinsten i förhållande till försäljningspriset." },
  { front: "Fördelningsnycklar", back: "Tid, Kvantitet/mängd, Värde" },
  { front: "Tjänsteomkostnader", back: "Kostnader för exempelvis personal & lokaler. De är relaterade till bla stödaktiviteter och tjänsteutveckling." },
  { front: "Differentierade materialomkostnadspålägg", back: "Dela upp materialomkostnaderna i flera omkostnadsposter och använda separata fördelningsnycklar." },
  { front: "Servicekostnadsställen", back: "Utför olika slag av uppgifter åt de direkta kostnadsställena." },
  { front: "Bidrag", back: "Resultatmått, dvs uttrycker skillnaden mellan intäkter, särintäkter och särkostnader." },
  { front: "Täckningsbidrag", back: "Skillnaden mellan särintäkter och särkostnader" },
  { front: "Bidragskrav", back: "Ett förutbestämt mål för hur stort täckningsbidrag en vara/tjänst måste ge för att bidra till att täcka företagets gemensamma samkostnader och vinst." },
  { front: "Stegkalkylen", back: "En utbyggd bidragskalkyl som beräknar täckningsbidrag i flera steg (nivåer). Den sorterar särkostnader på den nivå där de hör hemma – till exempel produkt, produktgrupp eller avdelning. Syftet är att visa hur varje del av verksamheten bidrar till att täcka de gemensamma samkostnaderna och skapa vinst." },
  { front: "Icke-återvinningsbar kostnad", back: "Kostnader för redan anskaffade resurser som inte kan påverkas oavsett vilken beslutssituation företaget befinner sig i." },
  { front: "Alternativkostnad", back: "Speciell typ av särkostnad. Värdet av det man väljer bort när man väljer ett visst handlingsalternativ. Det definieras som det överskott (t.ex. täckningsbidrag) man går miste om från det bästa av de alternativ man tackat nej till. Om en resurs inte har någon alternativ användning är alternativkostnaden noll." },
  { front: "Operationell vinst eller operationell förlust", back: "Det överskott som blir kvar när man dragit av både särkostnader och alternativkostnad från intäkterna. Uppstår när särintäkterna för ett valt handlingsalternativ är lägre än de totala uppoffringarna (summan av särkostnader och alternativkostnad). Det innebär att det alternativ man valde ger ett sämre resultat än om man hade valt det bästa av de bortvalda alternativen." },
  { front: "Budgetering", back: "Metod för ekonomisk styrning vilken innebär uppställande och användande av budgetar. Det är en process." },
  { front: "Resultatbudget", back: "Plan för hur intäkter och kostnader för verksamheten leder till ett resultat. Lyckas man skapa vinst?" },
  { front: "Likviditetsbudget", back: "Plan för hur pengar ska anskaffas och användas. Vilka medel som är tillgängliga, vilka medel som betalas in och ut. Uppfattning om likviditeten räcker till." },
  { front: "Budgeterad balansräkning", back: "Visar vilka tillgångar och skulder samt vilket eget kapital ett företag planeras ha vid en viss tidpunkt." },
  { front: "Budget", back: "Uttrycker strävanden, förväntningar och åtaganden för en organisation, gällande ekonomiska konsekvenser för en kommande period." },
  { front: "Strategisk planering", back: "Rör frågor relaterade till verksamhetens inriktning. Långsiktig och präglas av osäkerhet om framtiden." },
  { front: "Taktisk planering", back: "Planera verksamheten så att det som kommit till uttryck i den strategiska planeringen kan förverkligas. Mer detaljerad." },
  { front: "Operativ planering", back: "Handlar om planering av aktiviteter, en planering av hur det löpande arbetet i företaget ska genomföras under den närmast kommande perioden." },
  { front: "Funktionsbudget", back: "Tas primärt fram för att planera verksamheten baserat på de verksamhetsplaner som gäller. Planera verksamheten." },
  { front: "Projektbudget", back: "Planer för de olika projekt som bedrivs i verksamheten." },
  { front: "Produktbudget", back: "Beskriver vad man tänker sig för utfall för olika produkter eller produktgrupper för en kommande period." },
  { front: "Kundbudget/försäljningsbudget", back: "Planer för olika kategorier av kunder." },
  { front: "Resursbudget", back: "Avser exempelvis materialbudget och personalbudget." },
  { front: "Avdelningsbudget", back: "Används främst för att styra olika enheter. Ett instrument för uppföljning av avdelningar. Tas fram för att få insyn i enheten." },
  { front: "Personalbudget", back: "Budgetera personalen i olika kategorier för olika tjänster, kapaciteter i form av manår eller antal timmar, lönekostnader och övriga personalkostnader." },
  { front: "Administrationsbudget", back: "Innehåller sammanställning av de administrativa kostnaderna för verksamheten. Aktiviteter som ligger utanför själva varuflödet." },
  { front: "Inköpsbudget", back: "Underlag för beslut om hur inköpet ska gå till, vilka varor som ska köpas in och till vilket pris." },
  { front: "Lagerbudget", back: "Underlag för lagerhållningen av varor." },
  { front: "Produktionsbudget", back: "Budgetar för själva produktionen och kostnader samt volymer i denna." },
  { front: "Investeringsbudget", back: "Typ av projektbudget, där projektet syftar till att anskaffa något som kommer att bli en del av verksamhetens balansräkning." },
  { front: "Kapitalbudget", back: "Fokuserar på företagets investeringsbehov främst." },
  { front: "Omkostnadsbudget", back: "Man fokuserar på de viktigaste och största omkostnadsposterna." },
  { front: "Uppbyggnadsmetoden", back: "En demokratisk budgeteringsmetod där budgeten skapas nerifrån och upp i organisationen. Istället för att ledningen bestämmer alla siffror, låter man de som är närmast verksamheten ta fram förslagen." },
  { front: "Nedbrytningsmetoden", back: "Den direkta motsatsen till uppbyggnadsmetoden. Här dikteras villkoren uppifrån: ledningen sätter de stora ramarna först, och dessa bryts sedan ner i mindre delar för avdelningarna." },
  { front: "Den iterativa metoden", back: "Den mest realistiska budgeteringsmetoden och fungerar som en gyllene medelväg. Istället för att bara gå nerifrån-upp eller uppifrån-ner, ser man budgeteringen som en dialog som går fram och tillbaka (i cirklar) mellan ledning och avdelningar." },
  { front: "Avvikelseanalys", back: "Processen att jämföra budgeterat resultat med faktiskt utfall för att förstå varför skillnader (avvikelser) uppstått. Målet är att identifiera orsaker (t.ex. pris, volym, effektivitet) till positiva (gynnsamma) eller negativa (ogynnsamma) avvikelser, vilket hjälper till att vidta korrigerande åtgärder, förbättra framtida budgetar och öka ekonomisk kontroll och prestation." },
  { front: "Prognos", back: "En uppdaterad förutsägelse om hur framtiden ser ut, baserad på både faktiska siffror hittills och justerade förväntningar för resten av perioden." },
  { front: "Tröskelpaket", back: "Utgör det som man anser vara absolut nödvändigt för att över huvud taget uppnå det paketet syftar till. En slags miniminivå." },
  { front: "Tilläggspaket", back: "Det som inte är absolut nödvändigt men som av olika anledningar upplevs vara angeläget för verksamheten." },
  { front: "Variabilitetsprincipen", back: "Man relaterar intäkter och kostnader till de faktorer som man antar påverkar deras storlek." },
  { front: "Standard", back: "Ett förutberäknat värde för en viss uppoffring eller prestation för en kommande tidsperiod. Ger uttryck för vad man bestämt eller planerat att något kommer att kosta under en kommande period." },
  { front: "Basstandard", back: "Man justerar inte med hänsyn till förändringar uran man behåller samma standard." },
  { front: "Löpande standard", back: "Uppdateras hela tiden med nya kända förhållanden." },
  { front: "Lönestandarder", back: "Vanligaste. För arbetskraften beräknas dels en standardtid för utfört arbete, dels en standardkostnad per arbetad timme." },
  { front: "Materialstandarder", back: "Förutbestämd, normaliserad kostnad per producerad enhet, som specificerar både mängden (kvantitet) material som ska användas och dess pris (standardpris), ofta för en budgetperiod, för att mäta effektivitet (avvikelser) mot faktiska förbrukningar och priser i produktionen." },
  { front: "Omkostnadsstandarder", back: "Tas fram via pålägg. Handlar om att företagets kostnader fördelas ut på olika produkter med hjälp av olika pålägg." },
  { 
    front: "Investering", 
    back: "En satsning av ekonomiskt värde med grundad förhoppning om framtida avkastning. En kapitalsatsning som ger betalningskonsekvenser under en längre period. En uppoffring i nutiden i syfte att kunna öka inkomsterna i framtiden." 
  },
  { 
    front: "Investeringskalkyl", 
    back: "Sammanställning av in-och/eller utbetalningar för ett visst objekt för ett visst ändamål för en viss tidsperiod." 
  },
  { 
    front: "Reala investeringar", 
    back: "Utgör kapitalsatsningar i fysiska objekt, ex maskiner och anläggningar." 
  },
  { 
    front: "Immateriella investeringar", 
    back: "Utgör satsningar på ex kompetensutveckling och forskning och utveckling (FoU)." 
  },
  { 
    front: "Finansiella investeringar", 
    back: "Satsningar i aktier, fonder, obligationer och andra värdepapper." 
  },
  { 
    front: "Ersättningsinvesteringar", 
    back: "De utgifter företag gör för att ersätta föråldrad och sliten utrustning, maskiner m.m." 
  },
  { 
    front: "Expansionsinvesteringar", 
    back: "Nyinvestering i befintlig eller ny verksamhet för att öka kapacitet, marknadsandelar eller intäkter över tid." 
  },
  { 
    front: "Förbättringsinvesteringar", 
    back: "Ersättning av befintlig investering med ett bättre alternativ." 
  },
  { 
    front: "Miljöinvesteringar", 
    back: "Investeringar i åtgärder som minskar miljöpåverkan men som också bidrar ekonomiskt. Inre och yttre." 
  },
  { 
    front: "Grundinvestering", 
    back: "Summan av de utbetalningar som görs i samband med anskaffningen av investeringsobjektet. En initial kapitalsatsning." 
  },
  { 
    front: "Inbetalningsöverskott", 
    back: "Skillnaden mellan in-och utbetalningar." 
  },
  { 
    front: "Restvärde", 
    back: "Värdet investeringen har efter den ekonomiska livslängden har upphört." 
  },
  { 
    front: "Ekonomisk livslängd", 
    back: "Den tidsperioden under vilken det är ekonomiskt försvarbart att använda tillgångar alternativt den tid fram till vilken det är ekonomiskt fördelaktigt att byta ut en tillgång." 
  },
  { 
    front: "Kalkylränta", 
    back: "Den räntesats som representerar ett företags avkastningskrav på en investering." 
  },
  { 
    front: "Investeringsförlopp", 
    back: "Grundinvestering, Inbetalningar per år, Utbetalningar per år, Restvärde, r Kalkylränta." 
  },
  { 
    front: "Diskontering", 
    back: "Att ett värde beräknas bakåt i tiden med hänsyn till räntesats. (Metoden för att komma fram till nuvärde)." 
  },
  { 
    front: "Kapitalisering", 
    back: "Värdet av in- och utbetalningar bestäms vid någon framtida tidpunkt. (Metoden för att komma fram till slutvärde)." 
  },
  { 
    front: "Nuvärde", 
    back: "Sammanlagda värdet av in- och utbetalningar i tidpunkten 0." 
  },
  { 
    front: "Slutvärde", 
    back: "Sammanlagda värdet av in-och utbetalningar vid den ekonomiska livslängdens slut." 
  },
  { 
    front: "Annuitet", 
    back: "Uttrycker den årliga genomsnittliga kapitalkostnaden för grundinvesteringen." 
  },
  { 
    front: "Internränta", 
    back: "Den faktiska procentuella avkastningen ger per år. Det är den högsta räntan investeringen tål innan den slutar vara lönsam." 
  },
  { 
    front: "Tillväxtränta", 
    back: "Anger den genomsnittliga årliga avkastning en investering genererar när successivt frigjorda inbetalningsöverskott placeras till en avkastning motsvarande kalkylräntan." 
  },
  { 
    front: "Hård begränsning", 
    back: "Omständigheter utanför företagets egentliga kontroll som sätter gränser för investeringsverksamheten." 
  },
  { 
    front: "Mjuk begränsning", 
    back: "Företagets eget beslut att begränsa investeringsverksamheten." 
  },
  { 
    front: "Inflation", 
    back: "Den allmänna prisnivån ökar vilket medför en försvagning av penningvärdet." 
  },
  { 
    front: "Skalproblemet", 
    back: "Rangordnar på avkastning istället för på absolutbelopp." 
  },
  { 
    front: "Prestation", 
    back: "Vad som har åstadkommits, har utförts eller genomförts eller som i framtiden ska åstadkommas, utföras eller genomföras." 
  },
  { 
    front: "Prestationsmätning", 
    back: "Man mäter olika aspekter på prestationer." 
  },
  { 
    front: "Prestationsmått", 
    back: "Ett tal eller en annan storhet som i komprimerad form ger information om en prestation." 
  },
  { 
    front: "Förräntningsmarginalen", 
    back: "Skillnaden mellan räntabilitet på totalt kapital och genomsnittlig skuldränta" 
  },
  { 
    front: "Skuldsättningsgraden", 
    back: "Förhållandet mellan skulder och eget kapital" 
  },
  { 
    front: "Vinstmarginal", 
    back: "Hur stor andel av varje omsättningskrona som utgör vinst." 
  },
  { 
    front: "Kapitalomsättningshastighet", 
    back: "Anger hur stor omsättning (försäljning) varje investerad krona resulterat i." 
  },
  { 
    front: "Finansiella perspektivet", 
    back: "Klargör utfallet av strategin i finansiella termer. Försäljningsökning och produktivitet," 
  },
  { 
    front: "Kundperspektivet", 
    back: "Vad företaget erbjuder sina kunder. Differentiering." 
  },
  { 
    front: "Interna processperspektivet", 
    back: "Formulerar hur företaget avser att nå vad som beslutats i de två föregående perspektiven." 
  },
  { 
    front: "Operativa processer", 
    back: "Sådana som används vid produktion och leverans av tjänster och varor." 
  },
  { 
    front: "Kundprocesser", 
    back: "Inriktade på att utvidga och fördjupa kundrelationer." 
  },
  { 
    front: "Innovationsprocesser", 
    back: "Utveckla nya tjänster, varor och processer." 
  },
  { 
    front: "Reglerings- och samhällsprocesser", 
    back: "Fokuserar företagets relationer till den omgivning i vilken verksamheten bedrivs och syftar till att stärka trovärdigheten och legitimiteten." 
  },
  { 
    front: "Lärande-och tillväxtperspektivet", 
    back: "Redogör för företagets immateriella tillgångar och deras förbindelse till strategin." 
  },
  { 
    front: "Humankapital", 
    back: "Knutet till företagets medarbetare och består av deras individuella förmåga, kunskap, skicklighet, erfarenhet, motivation, kreativitet och innovationsförmåga." 
  },
  { 
    front: "Strukturkapital", 
    back: "Den struktur eller kapacitet företaget innehar och som syftar till att stödja arbetet i företaget." 
  }
];

const GRID_SIZE = 22;
const grid = ref([]);
const clues = reactive({ across: [], down: [] });
const revealed = ref(false);
const activeDirection = ref('across'); // 'across' eller 'down'
const focusedCell = ref(null); // {r, c}

const normalize = (str) => {
  return str.replace(/[^a-zA-ZåäöÅÄÖ]/g, '').toUpperCase();
};

const createEmptyGrid = () => {
  const g = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      row.push({ 
        char: null, 
        input: '', 
        number: null, 
        isCorrect: false,
        isAcross: false,
        isDown: false 
      });
    }
    g.push(row);
  }
  return g;
};

const placeWords = (words) => {
  let bestGrid = null;
  let bestScore = -1;
  
  for (let attempt = 0; attempt < 50; attempt++) {
    const tempGrid = createEmptyGrid();
    const placedWords = [];
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const candidates = shuffled.slice(0, 25);

    const firstWord = candidates[0];
    const startR = Math.floor(GRID_SIZE / 2);
    const startC = Math.floor((GRID_SIZE - firstWord.word.length) / 2);
    
    if (canPlace(tempGrid, firstWord.word, startR, startC, 'across')) {
      placeOnGrid(tempGrid, firstWord, startR, startC, 'across');
      placedWords.push({ ...firstWord, r: startR, c: startC, dir: 'across' });
    }

    for (let i = 1; i < candidates.length; i++) {
      const current = candidates[i];
      let placed = false;

      for (const p of placedWords) {
        if (placed) break;
        for (let j = 0; j < p.word.length; j++) {
          for (let k = 0; k < current.word.length; k++) {
            if (p.word[j] === current.word[k]) {
              const dir = p.dir === 'across' ? 'down' : 'across';
              const r = p.dir === 'across' ? p.r - k : p.r + j;
              const c = p.dir === 'across' ? p.c + j : p.c - k;

              if (canPlace(tempGrid, current.word, r, c, dir)) {
                placeOnGrid(tempGrid, current, r, c, dir);
                placedWords.push({ ...current, r, c, dir });
                placed = true;
                break;
              }
            }
          }
          if (placed) break;
        }
      }
      
      if (placedWords.length >= 8) break;
    }

    const across = placedWords.filter(w => w.dir === 'across').length;
    const down = placedWords.filter(w => w.dir === 'down').length;
    
    let score = placedWords.length;
    if (across < 3 || down < 3) score -= 5;
    const balance = 1 - Math.abs(across - down) / (across + down + 1);
    score += balance * 2;

    if (score > bestScore) {
      bestScore = score;
      bestGrid = { grid: tempGrid, placed: placedWords };
    }
  }
  return bestGrid;
};

const canPlace = (g, word, r, c, dir) => {
  if (r < 0 || c < 0) return false;
  if (dir === 'across') {
    if (c + word.length > GRID_SIZE) return false;
    if (c > 0 && g[r][c-1].char) return false; 
    if (c + word.length < GRID_SIZE && g[r][c+word.length].char) return false; 
  } else {
    if (r + word.length > GRID_SIZE) return false;
    if (r > 0 && g[r-1][c].char) return false; 
    if (r + word.length < GRID_SIZE && g[r+word.length][c].char) return false; 
  }

  for (let i = 0; i < word.length; i++) {
    const rr = dir === 'across' ? r : r + i;
    const cc = dir === 'across' ? c + i : c;
    if (g[rr][cc].char && g[rr][cc].char !== word[i]) return false;
    if (!g[rr][cc].char) {
      if (dir === 'across') {
        if (rr > 0 && g[rr-1][cc].char) return false;
        if (rr < GRID_SIZE-1 && g[rr+1][cc].char) return false;
      } else {
        if (cc > 0 && g[rr][cc-1].char) return false;
        if (cc < GRID_SIZE-1 && g[rr][cc+1].char) return false;
      }
    }
  }
  return true;
};

const placeOnGrid = (g, wordObj, r, c, dir) => {
  for (let i = 0; i < wordObj.word.length; i++) {
    const rr = dir === 'across' ? r : r + i;
    const cc = dir === 'across' ? c + i : c;
    g[rr][cc].char = wordObj.word[i];
    if (dir === 'across') g[rr][cc].isAcross = true;
    if (dir === 'down') g[rr][cc].isDown = true;
  }
};

const generateCrossword = () => {
  revealed.value = false;
  focusedCell.value = null;
  activeDirection.value = 'across';
  
  const wordList = flashcardsData
    .map(f => ({ word: normalize(f.front), clue: f.back }))
    .filter(w => w.word.length > 2 && w.word.length < 16);

  const result = placeWords(wordList);
  
  if (result) {
    grid.value = result.grid;
    clues.across = [];
    clues.down = [];
    let counter = 1;

    result.placed.sort((a, b) => (a.r - b.r) || (a.c - b.c));

    result.placed.forEach(p => {
      let num = grid.value[p.r][p.c].number;
      if (!num) {
        num = counter++;
        grid.value[p.r][p.c].number = num;
      }
      if (p.dir === 'across') clues.across.push({ number: num, text: p.clue });
      else clues.down.push({ number: num, text: p.clue });
    });
  }
};

const revealAll = () => {
  revealed.value = true;
  grid.value.forEach(row => {
    row.forEach(cell => {
      if (cell.char) cell.input = cell.char;
    });
  });
};

const checkAnswers = () => {
  grid.value.forEach(row => {
    row.forEach(cell => {
      if (cell.char) {
        cell.isCorrect = cell.input.toUpperCase() === cell.char;
      }
    });
  });
};

// --- UPPDATERAD LOGIK FÖR SKRIVANDE OCH BACKSPACE ---

const cellClicked = (r, c) => {
  const cell = grid.value[r][c];
  if (!cell.char) return;

  if (focusedCell.value?.r === r && focusedCell.value?.c === c) {
    if (cell.isAcross && cell.isDown) {
      activeDirection.value = activeDirection.value === 'across' ? 'down' : 'across';
    }
  } else {
    focusedCell.value = { r, c };
    if (cell.isAcross && !cell.isDown) activeDirection.value = 'across';
    else if (!cell.isAcross && cell.isDown) activeDirection.value = 'down';
  }
};

// Hantera vanlig inmatning (framåt)
const handleInput = (e, r, c) => {
  const val = e.target.value.toUpperCase();
  // Uppdatera modellen manuellt för säkerhets skull
  grid.value[r][c].input = val.slice(-1); // Ta bara sista tecknet om man skriver snabbt

  if (val) {
    moveFocus(r, c, 1); // Flytta 1 steg framåt
  }
};

// Hantera Backspace (bakåt)
const handleKeydown = (e, r, c) => {
  if (e.key === 'Backspace') {
    // Om rutan redan är tom, hoppa bakåt först och töm sedan den rutan
    if (!grid.value[r][c].input) {
      e.preventDefault(); // Förhindra standardbeteende
      moveFocus(r, c, -1);
    }
    // Om rutan har en bokstav kommer v-model tömma den automatiskt, vi stannar kvar
  }
};

const moveFocus = (r, c, step) => {
  let nextR = r;
  let nextC = c;

  if (activeDirection.value === 'across') {
    nextC += step;
  } else {
    nextR += step;
  }

  // Kolla att vi är inom gränserna
  if (nextR >= 0 && nextR < GRID_SIZE && nextC >= 0 && nextC < GRID_SIZE) {
    const nextCell = grid.value[nextR][nextC];
    
    // Om nästa ruta är en del av korsordet, flytta fokus
    if (nextCell.char) {
      focusedCell.value = { r: nextR, c: nextC };
      
      // Om vi backar (step -1) och rutan vi landar på har text, töm den
      if (step === -1 && nextCell.input) {
        grid.value[nextR][nextC].input = '';
      }

      // Sätt fokus i DOM
      nextTick(() => {
        const el = document.getElementById(`cell-${nextR}-${nextC}`);
        if (el) el.focus();
      });
    }
  }
};

const isClueActive = (num, dir) => {
  if (!focusedCell.value) return false;
  return activeDirection.value === dir;
};

onMounted(() => {
  generateCrossword();
});
</script>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  font-family: Arial, sans-serif;
  color: #333;
}

.main-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.controls-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.action-btn {
  background-color: #FFCCFD;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: filter 0.2s;
}

.action-btn:hover {
  filter: brightness(0.95);
}

.crossword-layout {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 3rem;
  width: 100%;
  justify-content: center;
}

/* RUTNÄT */
.grid-wrapper {
  overflow: auto;
}

.grid-container {
  display: flex;
  flex-direction: column;
  background-color: transparent; 
  gap: 0; 
}

.grid-row {
  display: flex;
}

.cell {
  width: 34px;
  height: 34px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Aktiva celler (ord) */
.cell-active {
  background-color: white;
  border: 1px solid #333; 
}

.cell-correct {
  background-color: #d1fae5;
}

.cell-focused {
  background-color: #fff9c4; 
}

/* Tomma celler (osynliga) */
.cell-block {
  background-color: transparent;
  border: none;
}

.cell input {
  width: 100%;
  height: 100%;
  border: none;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  background: transparent;
  outline: none;
  color: #333;
  padding: 0;
  cursor: text;
}

.cell-number {
  position: absolute;
  top: 1px;
  left: 2px;
  font-size: 9px;
  color: #666;
  pointer-events: none;
  z-index: 10;
}

/* LEDTRÅDAR */
.clues-container {
  display: flex;
  gap: 2rem;
  text-align: left;
  max-width: 500px;
  max-height: 700px;
  overflow-y: auto;
}

.clues-column {
  flex: 1;
}

.clues-column h3 {
  border-bottom: 2px solid transparent;
  padding-bottom: 5px;
  margin-top: 0;
  transition: border-color 0.3s;
}

.active-clue-header {
  border-bottom-color: #FFCCFD !important;
  color: #d63384; 
}

.clues-column ul {
  list-style: none;
  padding: 0;
}

.clues-column li {
  margin-bottom: 10px;
  font-size: 0.9rem;
  line-height: 1.4;
  padding: 4px;
  border-radius: 4px;
}

.empty-msg {
  font-style: italic;
  color: #888;
}

@media (max-width: 1000px) {
  .crossword-layout {
    flex-direction: column;
    align-items: center;
  }
  .clues-container {
    width: 100%;
  }
}
</style>