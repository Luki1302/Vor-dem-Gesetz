---
title: April
---

<div class="content-page">

<section>

# April

</section>

<section>

## Recherche

Als ersten Schritt analysierte ich fünf Applikationen, die das digitale Lesen auf unterschiedliche Arten zu verbessern versuchen. Die Auswahl reichte von simplen Lesemodi bis zu algorithmischen Eingriffen in die Typografie selbst.

Instapaper ist eine App, über die man Online-Artikel in einer persönlichen Bibliothek speichern und in einem bereinigten Leseformat lesen kann. Der Fokus liegt auf Ablenkungsfreiheit: Werbung, Navigation und visuelles Rauschen werden entfernt, der Text steht im Vordergrund. Man wählt aktiv aus, was man liest, und wann.

:media-image{src="/assets/april/apr-1.avif" size="hoch"}
:media-image{src="/assets/april/apr-2.avif" size="hoch"}
<aside>Features (View Notes, Multiselect Tagging) der App Instapaper. Instapaper Blog (2025). blog.instapaper.com</aside>

Spritz Reader verwendet RSVP als Methode. Wörter erscheinen einzeln an einer fixen Position, wobei jeweils ein Buchstabe farblich hervorgehoben wird – der sogenannte Optimal Recognition Point, der die Fixation des Auges auf die statisch günstigste Stelle im Wort lenkt. Die Methode ermögliche sehr hohe Lesegeschwindigkeiten, eliminiert jedoch die Möglichkeit der Regression.

:media-video{src="/assets/april/apr-3.mp4" size="quer"}
<aside>Screenrecording der Visualisierung des Spritz Reader. Spritz Reader (2026). spritzreader.com</aside>

BeeLine Reader greift nicht in die Struktur des Textes ein, sondern in seine Farbe: Durch einen Farbgradienten, der von Zeile zu Zeile wechselt, wird der Zeilensprung erleichtert. Das reduziert einen der häufigsten Lesefehler beim Bildschirmlesen – das versehentliche Überspringen oder Wiederholen einer Zeile. Der Ansatz ist subtil und greift die Grundbedingungen des Lesens an, ohne den Text selbst zu verändern.

:media-image{src="/assets/april/apr-4.avif" size="quer"}
<aside>Screenshot der Visualisierung des BeeLine Reader. BeeLine Reader (2017). beelinereader.com</aside>

Bionic Reading setzt die ersten Buchstaben jedes Wortes fett, um die Anzahl der Fixierungen zu reduzieren. Die Idee basiert darauf, dass das Gehirn Wörter ohnehin aus partieller visueller Information ergänzt. Bionic Reading verstärkt den Anfang, damit das Gehirn schneller erkennt. Die Methode ist aber umstritten, da sie die gewohnten Wortbilder verändert und eine Eingewöhnungszeit braucht. Für manche Menschen ist sie effektiv, für andere störend.

:media-image{src="/assets/april/apr-5.avif" size="klein"}
<aside>Screenshot der Visualisierung des Bionic Reading. Bionic Reading (2026). bionic-reading.com</aside>

Hier schreibe ich noch etwas zum Lesemodus generell.

:media-image{src="/assets/april/apr-6.avif" size="quer"}
<aside><aside>Screenshot des Lesemodus in Google Chrome. Georgien (2026). In Wikipedia. de.wikipedia.org/wiki/Georgien</aside>
</aside>

Browser-Lesemodi sind in den drei grossen Browser – Google Chrome, Apple Safari und Mozilla Firefox – unterschiedlich implementiert. Allen gemeinsam ist das Entfernen von Werbung, Navigation und Bildern sowie eine Grundtypografie, die für Lesbarkeit ausgelegt ist. Die Unterschiede liegen in den Anpassungsoptionen, da nicht alle Browser die gleichen Funktionen bereitstellen. Keiner der drei Modi kennt scrollbasierte Hervorhebung, kinetische Typografie oder erweiterte sensorische Interaktion.

<div class="media-trio">

:media-image{src="/assets/april/apr-7.avif" size="quer"}
:media-image{src="/assets/april/apr-8.avif" size="quer"}
:media-image{src="/assets/april/apr-9.avif" size="quer"}

</div>
<aside>Lesemodi in Google Chrome, Apple Safari und Mozilla Firefox (Screenshots, 2026)</aside>


</section>

<section>

## Experimente

Die Recherche inspirierte mich dazu, meinen eigenen Web-Reader zu bauen. Gleichzitig fehlte mir noch die Entscheidung: Welcher Informationstext soll als Grundlage für die weiteren Experimente dienen?

Die Antwort war Wikipedia. Die Artikel sind klar strukturiert, sachlich und werden nicht als Prosa gelesen. Gleichzeitig sind sie wegen ihres Erscheinungsbildes kaum zum Lesen einladend – zu dicht, zu unruhig, zu wenig Weissraum. Die Enzyklopädie ist inhaltlich neutral, da viele verschiedene Autor:innen an den Texten mitwirken. Sie ist frei zugänglich und über die Wikipedia REST API programmatisch abrufbar. Und sie liegt thematisch weit genug von meiner eigenen Thematik entfernt – anders als ein Buch über Typografie würde sie die Beurteilung der Experimente nicht inhaltlich überlagern.

Wikipedia-Artikel haben ausserdem eine klare HTML-Hierarchie aus Überschriften, Absätzen, Listen und Verlinkungen. Diese Struktur lässt sich direkt über Code ansprechen und für Experimente mit Bewegung und Interaktion nutzen.

Der erste technische Schritt war der Aufbau einer Verbindung zwischen dem lokalen Entwicklungsserver und der Wikipedia REST API. Über die Suchleiste lassen sich nun beliebige Artikel in verschiedenen Sprachen abrufen. Die internen Verlinkungen zu anderen Artikeln bleiben erhalten. Ein Klick auf einen verlinkten Begriff lädt den entsprechenden Artikel direkt im Reader. So lässt sich die gesamte Enzyklopädie innerhalb eines einzigen, kontrollierten Leseformats durchqueren.

:media-image{src="/assets/april/apr-10.avif" size="hoch"}
:media-image{src="/assets/april/apr-11.avif" size="hoch"}
<aside>Inhalt über Wikipedia REST API. Birken (2026). In Wikipedia. https://de.wikipedia.org/wiki/Birken.</aside>

Beim Laden wird der rohe Wikipedia-HTML bereinigt: Bilder, Infoboxen, Fussnoten, und Navigationsleisten werden entfernt. Was bleibt, ist der reine Textinhalt mit seiner semantischen Struktur. Schon allein die Änderung der Schriftart erzeugte eine spürbar angenehmere Lesesituation.

:media-image{src="/assets/april/apr-12.avif" size="hoch"}
:media-image{src="/assets/april/apr-13.avif" size="hoch"}
<aside>Inhalt über Wikipedia REST API. Birken (2026). In Wikipedia. https://de.wikipedia.org/wiki/Birken.</aside>

In einem nächsten Schritt wurden die ersten Steuerelemente hinzugefügt: individuelle Anpassbarkeit von Schriftgrösse, Zeilenabstand und Spaltenbreite.

Parallel dazu entstand ein erster Satzfokus-Modus: Ein Klick auf einen Satz dimmt alle anderen, der aktive Satz bleibt vollständig lesbar. Die technische Umsetzung brachte das Problem ans Licht, dass der Satztrenner nicht jeden Satz korrekt erkannte. Ein weiteres Problem ist die Wahl der Schriftart, welche unter Umständen nicht alle Schriftzeichen beinhaltet.

:media-image{src="/assets/april/apr-14.avif" size="quer"}
<aside>Inhalt über Wikipedia REST API. Birken (2026). In Wikipedia. https://de.wikipedia.org/wiki/Birken.</aside>

Mit den erarbeiteten Steuerelementen versuchte ich, den digitalen Text nach typografischen Grundprinzipien zu setzen. Die Parameter sollten so eingestellt werden, dass die Grundbedingungen des Lesens erfüllt sind, bevor weitere Eingriffe durch Bewegung oder Interaktion hinzukommen.

:media-image{src="/assets/april/apr-15.avif" size="quer"}
:media-image{src="/assets/april/apr-16.avif" size="halb"}
<aside>Inhalt über Wikipedia REST API. Johann Wolfgang von Goethe (2026). In Wikipedia. https://de.wikipedia.org/wiki/Johann_Wolfgang_von_Goethe.</aside>

Um zu verstehen, welche Strukturelemente in Wikipedia-Artikeln vorhanden sind, hob ich die HTML-Tags farblich hervor. Jeder Tag-Typ erhielt eine eigene Farbe. Die Untersuchung zeigte, dass die meisten Artikel einer klaren Hierarchie folgen, in einzelnen Fällen aber deutlich komplexer werden. Diese Analyse war die Grundlage dafür, störende Elemente gezielt auszublenden oder umgestalten zu können, ohne den inhaltlichen Zusammenhang des Artikels zu brechen.

<div class="media-trio">

:media-image{src="/assets/april/apr-17.avif" size="hoch"}
:media-image{src="/assets/april/apr-18.avif" size="hoch"}
:media-image{src="/assets/april/apr-19.avif" size="hoch"}

</div>
<aside>Inhalt über Wikipedia REST API. Johann Wolfgang von Goethe (2026; links) und Polen (2026; rechts). In Wikipedia. https://de.wikipedia.org/wiki/Johann_Wolfgang_von_Goethe. https://de.wikipedia.org/wiki/Polen</aside>

In einem zweiten Schritt wählte ich eine andere Darstellungsmethode, um Block-Tags und Inline-Tags visuell gleichzustellen. Ausserdem untersuchte ich, wie Wikipedia Bilder und Bildunterschriften im HTML einbettet und veränderte deren Darstellung.

:media-image{src="/assets/april/apr-20.avif" size="quer"}
:media-image{src="/assets/april/apr-21.avif" size="halb"}
<aside>Inhalt über Wikipedia REST API. Polen (2026). In Wikipedia. https://de.wikipedia.org/wiki/Polen</aside>

Hier steht ein Text

:media-image{src="/assets/april/apr-21-2.avif" size="hoch"}
<aside></aside>

Die ersten gestalterischen Experimente untersuchten eine Mouse-Hover Interaktion: Beim Überfahren einzelner Wörter veränderten sich Schriftgewicht und Schriftgrösse über die Achsen der variablen Schrift.

:media-video{src="/assets/april/apr-22.mp4" size="hoch"}
:media-image{src="/assets/april/apr-23.avif" size="hoch"}
<aside>Inhalt über Wikipedia REST API. Tree (2026; oben) und Assemblée nationale (2026; unten). In Wikipedia. https://en.wikipedia.org/wiki/Tree. https://fr.wikipedia.org/wiki/Assembl%C3%A9e_nationale_(France)</aside>

Die Ergebnisse machten vor allem den Unterschied zwischen subtiler und extremer Animation sichtbar. Bei subtilen Veränderungen blieb der Textzusammenhang erhalten. Bei extremen drohten einzelne Wörter aus ihrem Kontext gerissen zu werden. Gleichzeitig entstand ein interessanter Nebeneffekt. Durch das Überfliegen, können durch die zufällige Aktivierung eigene Zusammenhänge zwischen einzelnen Wörter gebildet werden. Das Wort "Überfliegen" kann hier als Lesetechnik und als Beschreibung dessen gesehen werden, was in diesem Experiment passiert.

:media-video{src="/assets/april/apr-24.mp4" size="hoch"}
:media-video{src="/assets/april/apr-25.mp4" size="hoch"}
<aside>Inhalt über Wikipedia REST API. Johann Wolfgang von Goethe (2026; oben) und Amphibien (2026; unten). In Wikipedia. https://de.wikipedia.org/wiki/Johann_Wolfgang_von_Goethe. https://de.wikipedia.org/wiki/Amphibien</aside>

Im Gespräch mit Gabriele A. Forster wurde die individualisierte Steuerung der Lesegeschwindigkeit als gestalterischer Ansatz diskutiert. Daraus entstand das Gyroskop-Experiment: Die Neigung des Smartphones steuert die Scrollgeschwindigkeit – nach vorne scrollen, zurückneigen verlangsamen. Ein Tap-Scroll bleibt weiterhin möglich, die Fuktion lässt sich per Button ein- und ausschalten.

Die grösste Herausforderung war die Zugänglichkeit. Browser geben Sensordaten aus Sicherheitsgründen unterschiedlich frei – Nutzer:innen müssen den Zugriff explizit erlauben. Nach der Freigabe wird über einen Button der Nullpunkt gesetzt: der Winkel, bei dem kein Scroll stattfindet.

:media-image{src="/assets/april/apr-26.avif" size="xs"}
<aside>Inhalt über Wikipedia REST API. Saccade (2026). In Wikipedia. https://en.wikipedia.org/wiki/Saccade</aside>

Beim Testen des Gyroskop-Experiments zeigte sich ein wiederkehrendes Problem: Proband:innen schafften den Zeilensprung nicht zuverlässig – die ungewohnte Steuerung erschwerte die Augenführung zusätzlich. Das führte zu einem anschliessenden Experiment, das sich gezielt mit der Führung des Blicks beschäftigt. Inspiriert vom Prinzip des RSVP wird der Text wortweise hervorgehoben – immer in der Mitte des Bildschirms fixiert –, um dem Auge stabilere Fixationspunkte zu geben.

:media-video{src="/assets/april/apr-27.mp4" size="quer"}
:media-video{src="/assets/april/apr-28.mp4" size="hoch"}
<aside>Inhalt über Wikipedia REST API. Saccade (2026). In Wikipedia. https://en.wikipedia.org/wiki/Saccade</aside>

</section>

<section>

### Moodboard

:media-image{src="/assets/april/apr-29-moodboard/apr-29-moodboard-1.avif" size="quer"}
:media-image{src="/assets/april/apr-29-moodboard/apr-29-moodboard-2.avif" size="quer"}
:media-image{src="/assets/april/apr-29-moodboard/apr-29-moodboard-3.avif" size="quer"}
:media-image{src="/assets/april/apr-29-moodboard/apr-29-moodboard-4.avif" size="quer"}
:media-image{src="/assets/april/apr-29-moodboard/apr-29-moodboard-5.avif" size="quer"}
:media-image{src="/assets/april/apr-29-moodboard/apr-29-moodboard-6.avif" size="quer"}
:media-image{src="/assets/april/apr-29-moodboard/apr-29-moodboard-7.avif" size="quer"}
:media-image{src="/assets/april/apr-29-moodboard/apr-29-moodboard-8.avif" size="quer"}
:media-image{src="/assets/april/apr-29-moodboard/apr-29-moodboard-9.avif" size="quer"}
:media-image{src="/assets/april/apr-29-moodboard/apr-29-moodboard-10.avif" size="quer"}
:media-video{src="/assets/april/apr-29-moodboard/apr-29-moodboard-11.mp4" size="quer"}
<aside>Moodboard – Swiss Photomonth (2025); Pinterest (o. J.–2026). de.pinterest.com</aside>

</section>

### Experimente

<section>

Inspiriert von Blickführung und linearer Hierarchie untersuchte ich die verlinkten Wörter, die in Wikipedia-Artikeln en masse vorkommen. Sie stören den Lesefluss, sind aber nicht wegzulassen. Sie bilden eine Kernfunktion der Enzyklopädie. Ich versuchte, diese Struktur innerhalb eines Artikels sichtbar zu machen: Jeder Link wird in seiner Reihenfolge markiert und mit einer geraden Linie mit dem nächsten verbunden. Es entstehen immer neue Formen, die die Komplexität der Enzyklopädie visualisieren. Gleichzeitig lassen sich durch die Wortpaare grobe Themenfelder eines Artikels erschliessen, ohne den genauen Inhalt zu kennen.

<div class="media-trio">

:media-image{src="/assets/april/apr-30-1.avif" size="quer"}
:media-image{src="/assets/april/apr-30-2.avif" size="quer"}
:media-image{src="/assets/april/apr-30-3.avif" size="quer"}

</div>
<aside>Inhalt über Wikipedia REST API. Saccade (2026). In Wikipedia. https://en.wikipedia.org/wiki/Saccade</aside>

Hier kommt ein Text.

:media-image{src="/assets/april/apr-32/apr-32-1.avif" size="quer"}
:media-image{src="/assets/april/apr-32/apr-32-2.avif" size="quer"}
:media-image{src="/assets/april/apr-32/apr-32-3.avif" size="quer"}
:media-image{src="/assets/april/apr-32/apr-32-4.avif" size="quer"}
:media-image{src="/assets/april/apr-32/apr-32-5.avif" size="quer"}
:media-image{src="/assets/april/apr-32/apr-32-6.avif" size="quer"}
:media-image{src="/assets/april/apr-32/apr-32-7.avif" size="quer"}
:media-image{src="/assets/april/apr-32/apr-32-8.avif" size="quer"}
:media-image{src="/assets/april/apr-32/apr-32-9.avif" size="quer"}
:media-image{src="/assets/april/apr-32/apr-32-10.avif" size="quer"}
:media-image{src="/assets/april/apr-32/apr-32-11.avif" size="quer"}
:media-image{src="/assets/april/apr-32/apr-32-12.avif" size="quer"}
<aside>Inhalt über Wikipedia REST API. Saccade (2026). In Wikipedia. https://en.wikipedia.org/wiki/Saccade</aside>

Dieses flüchtige Erfassen von Inhalten war die Inspiration für das nächste Experiment. Das manchmal undurchsichtige Dickicht an Informationen brachte mich dazu, mit der Lesbarkeit einzelner Wörter innerhalb eines Satzes zu spielen.

:media-video{src="/assets/april/apr-33.mp4" size="hoch"}
<aside>Inhalt über Wikipedia REST API. Digitale Kunst (2026). In Wikipedia. https://de.wikipedia.org/wiki/Digitale_Kunst</aside>

In der kulturgeschichtlichen Thesis griff ich das Beispiel «Nord» (2003 – 2004) von Esther Hunziker auf. Die spielerische Individualisierung von Inhalten durch einen begrenzten Handlungsspielraum inspirierte mich dazu, einzelne Textabschnitte und Bilder trennbar und frei anordenbar zu machen. Es entsteht eine andere Art zu lesen – Inhalte werden abschnittsweise erfahren, neue Zusammenhänge können gebildet werden. Die Umsetzung war noch holprig: Texte verschoben sich zunehmend nach unten, der Überblick ging schnell verloren.

:media-image{src="/assets/april/apr-34.avif" size="hoch"}
:media-video{src="/assets/april/apr-35.mp4" size="hoch"}
<aside>Inhalt über Wikipedia REST API. Marie Curie (2026). In Wikipedia. https://fr.wikipedia.org/wiki/Marie_Curie</aside>

Ein strukturelles Experiment teilte den Text kapitelweise in Spalten auf. Nebeneinander platzierte Abschnitte lassen sich einfach vergleichen und geben den Gesamtüberblick besser wieder als ein endloser Scroll.

:media-video{src="/assets/april/apr-36.mp4" size="hoch"}
:media-video{src="/assets/april/apr-37.mp4" size="hoch"}
<aside>Inhalt über Wikipedia REST API. Johann Wolfgang von Goethe (2026). In Wikipedia. https://de.wikipedia.org/wiki/Johann_Wolfgang_von_Goethe.</aside>

</section>

### Fazit

<section>

Der April war eine breite Erkundungsphase, in der viele gestalterische Richtungen ausprobiert und ein Überblick über die Möglichkeiten des Formats geschaffen wurden. Die Einschränkung auf Wikipedia-Artikel erwies sich dabei als Vorteil, da sie eine vollständige Konzentration auf die Gestaltung ermöglichte.

Im Mentorat wurden jedoch wichtige Fragen aufgeworfen, die den weiteren Prozess prägen werden. Die Experimente müssen klarer nach ihrem Ziel befragt werden. Geht es um Leseerlebnis, Textverständnis, einen spielerischen Zugang oder um etwas anderes? Und für welche Inhalte passt welches Experiment? Nicht jeder Ansatz funktioniert für jeden Artikeltyp gleich gut.

Deutlich wurde auch, dass Bewegung oft mehr Störung als Unterstützung ist – und dass weniger Interaktion manchmal mehr Orientierung schafft. Das letzte Experiment mit der Spaltenansicht zeigte das exemplarisch.

Zwei Richtungen stehen offen: verschiedene Experimente anhand eines einzigen Artikels oder wenige, präzise Experimente anhand verschiedener Texttypen. Es geht um die genauere Definition der Forschungsfrage im Rahmen der Überschrift «Wikipedia reimagined».

</section>

</div>
