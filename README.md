# Tango
##Tanda Player
###Justification
Tango music is played at social events called 'Milongas'. Unlike most music events, a Milonga may use live or recorded music played according to an etiquette. Dancers need to learn their craft by practicing to music and although not necessary, it is sometimes nice to have the practice with music played in a similar manner to a Milonga.
Music players such as laptops or iPods and similar devices often support playlists where the owner can put the songs to play in a fixed order and this would work very well, particularly the first time. However, when the same playlist is used again and again it becomes too predictable and may only play a few dozen songs out of a collection of possibly thousands.
Where as software such as iTunes can create dynamic playlists, it is difficult to change the rules part way through. That's where the Tanda Player comes in. The Tanda Player can be programmed with the structure and types of music to play and it can go and find some songs to play from the owner's collection. Milonga etiquette allows for the music to be grouped according to some criteria such as "all the songs are by the same orchestra and from the same period of their career so that they sound good together and have a similar feel to each other". This group of music choices is called a "Tanda" and may be 3 or more pieces of music. Acting as punctuation between the groups of music and allowing dancers to change partners, often a short piece of music of a different music style is played known as a "cortina". The Tanda Player can be configured to insert cortinas between the tandas.
###Overview
This project has been developed around a Raspberry Pi with a HiFiBerry DAC sound card to provide superb sound quality. The device acts much like an iPod in that it is simply plugged into the PA system. 
The Raspberry Pi also acts as a wifi hotspot and hosts a web site which shows what is currently playing and what's next. It also allows a user to remotely tweak the behaviour through controls on a web page which can be changed through a mobile phone or a laptop etc.
###Setup
The computer simply reads music from a USB device plugged in. The USB device contains the music and a configuration file. The configuration file gives insight into how the meta-data in the music can be used and also describes the structure of the playlist it is to put together.
The music is stored in a folder off the root of the USB device as is another folder with short pieces of music to be used as Cortinas.
The system works reasonably well with just a simple coding system added to each track's "comment" MP3 tag. This is easily managed through software such as iTunes. Music in iTunes can also be easily dragged onto a USB memory stick and this can then be put into the Raspberry Pi, boot up and it will start playing.
###Raspberry Pi Setup
There are many web sites around which describe in step-by-step manners how to get the Raspberry Pi up and running. Also how to configure it to be a wifi-hotspot. The Hifi-Berry site describes how to install their DAC and similar sound cards could be used. This project is not about that.
The music player underlying this project is the MPD and MPC pair. MPD manages the music database and reads all the meta-data in the music files. MPC is used as the control interface used to create and play playlists.
This project requires one additional component to be installed and that is "node-js". This is used to host the web site.
Nearly all the code in this project is written in JavaScript and nearly all data files are JSON format. The exceptions are only a few scripts written as shell scripts or python scripts etc.
##Tanda Concepts
For the purposes of this project a Tanda can be any number of songs and each Tanda may contain different numbers of songs to the others.
Etiquette for putting Tandas together is focussed on putting together songs that are musically similar so that dancers can decide if they wish to dance to that music and know that they will have a few songs of this type to dance with a partner. Further the music styles are usually grouped into three broad categories; Tango, Vals and Milonga. This time Milonga is the music style and not the event. 
The Tanda Player allows tandas to be defined such that they consist of just one type of music or a mix if required. Typically, an evenings music would consist of a pattern of tandas such as "Tango, Tango, Vals, Tango, Tango, Milonga" which repeats. Each Tanda typically containing 3 or 4 songs. 

