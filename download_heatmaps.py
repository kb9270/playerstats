#!/usr/bin/env python3
"""
Lazy Heatmap Downloader — Generated 2026-04-01 11:50
Downloads SofaScore heatmap images for 2222 matched players.
Run: python download_heatmaps.py
"""
import os, time, random, requests
from pathlib import Path
from tqdm import tqdm

ROOT = Path(__file__).parent
HEATMAPS_DIR = ROOT / "assets" / "heatmaps"
HEATMAPS_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0",
    "Accept": "image/png,image/*",
}

PLAYERS = [
  {
    "player": "Brenden Aaronson",
    "id": 973431,
    "url": "https://api.sofascore.app/api/v1/player/973431/heatmap/overall",
    "file": "assets/heatmaps/973431.png"
  },
  {
    "player": "Zach Abbott",
    "id": 1390490,
    "url": "https://api.sofascore.app/api/v1/player/1390490/heatmap/overall",
    "file": "assets/heatmaps/1390490.png"
  },
  {
    "player": "Jones El-Abdellaoui",
    "id": 1173575,
    "url": "https://api.sofascore.app/api/v1/player/1173575/heatmap/overall",
    "file": "assets/heatmaps/1173575.png"
  },
  {
    "player": "Ali Abdi",
    "id": 919027,
    "url": "https://api.sofascore.app/api/v1/player/919027/heatmap/overall",
    "file": "assets/heatmaps/919027.png"
  },
  {
    "player": "Salis Abdul Samed",
    "id": 993455,
    "url": "https://api.sofascore.app/api/v1/player/993455/heatmap/overall",
    "file": "assets/heatmaps/993455.png"
  },
  {
    "player": "Saud Abdulhamid",
    "id": 966849,
    "url": "https://api.sofascore.app/api/v1/player/966849/heatmap/overall",
    "file": "assets/heatmaps/966849.png"
  },
  {
    "player": "Laurent Abergel",
    "id": 296434,
    "url": "https://api.sofascore.app/api/v1/player/296434/heatmap/overall",
    "file": "assets/heatmaps/296434.png"
  },
  {
    "player": "Matthis Abline",
    "id": 999070,
    "url": "https://api.sofascore.app/api/v1/player/999070/heatmap/overall",
    "file": "assets/heatmaps/999070.png"
  },
  {
    "player": "Abner",
    "id": 973838,
    "url": "https://api.sofascore.app/api/v1/player/973838/heatmap/overall",
    "file": "assets/heatmaps/973838.png"
  },
  {
    "player": "Zakaria Aboukhlal",
    "id": 856737,
    "url": "https://api.sofascore.app/api/v1/player/856737/heatmap/overall",
    "file": "assets/heatmaps/856737.png"
  },
  {
    "player": "Tammy Abraham",
    "id": 610766,
    "url": "https://api.sofascore.app/api/v1/player/610766/heatmap/overall",
    "file": "assets/heatmaps/610766.png"
  },
  {
    "player": "Francis Abu",
    "id": 988801,
    "url": "https://api.sofascore.app/api/v1/player/988801/heatmap/overall",
    "file": "assets/heatmaps/988801.png"
  },
  {
    "player": "Giorgi Abuashvili",
    "id": 985199,
    "url": "https://api.sofascore.app/api/v1/player/985199/heatmap/overall",
    "file": "assets/heatmaps/985199.png"
  },
  {
    "player": "Francesco Acerbi",
    "id": 126816,
    "url": "https://api.sofascore.app/api/v1/player/126816/heatmap/overall",
    "file": "assets/heatmaps/126816.png"
  },
  {
    "player": "Ragnar Ache",
    "id": 877544,
    "url": "https://api.sofascore.app/api/v1/player/877544/heatmap/overall",
    "file": "assets/heatmaps/877544.png"
  },
  {
    "player": "Joshua Acheampong",
    "id": 1403050,
    "url": "https://api.sofascore.app/api/v1/player/1403050/heatmap/overall",
    "file": "assets/heatmaps/1403050.png"
  },
  {
    "player": "Akor Adams",
    "id": 946381,
    "url": "https://api.sofascore.app/api/v1/player/946381/heatmap/overall",
    "file": "assets/heatmaps/946381.png"
  },
  {
    "player": "Che Adams",
    "id": 773409,
    "url": "https://api.sofascore.app/api/v1/player/773409/heatmap/overall",
    "file": "assets/heatmaps/773409.png"
  },
  {
    "player": "Tyler Adams",
    "id": 800419,
    "url": "https://api.sofascore.app/api/v1/player/800419/heatmap/overall",
    "file": "assets/heatmaps/800419.png"
  },
  {
    "player": "Tosin Adarabioyo",
    "id": 352668,
    "url": "https://api.sofascore.app/api/v1/player/352668/heatmap/overall",
    "file": "assets/heatmaps/352668.png"
  },
  {
    "player": "Jayden Addai",
    "id": 1177723,
    "url": "https://api.sofascore.app/api/v1/player/1177723/heatmap/overall",
    "file": "assets/heatmaps/1177723.png"
  },
  {
    "player": "Karim Adeyemi",
    "id": 940054,
    "url": "https://api.sofascore.app/api/v1/player/940054/heatmap/overall",
    "file": "assets/heatmaps/940054.png"
  },
  {
    "player": "Simon Adingra",
    "id": 1110842,
    "url": "https://api.sofascore.app/api/v1/player/1110842/heatmap/overall",
    "file": "assets/heatmaps/1110842.png"
  },
  {
    "player": "Nathaniel Adjei",
    "id": 1103079,
    "url": "https://api.sofascore.app/api/v1/player/1103079/heatmap/overall",
    "file": "assets/heatmaps/1103079.png"
  },
  {
    "player": "Jonas Adjetey",
    "id": 1218056,
    "url": "https://api.sofascore.app/api/v1/player/1218056/heatmap/overall",
    "file": "assets/heatmaps/1218056.png"
  },
  {
    "player": "Amine Adli",
    "id": 991478,
    "url": "https://api.sofascore.app/api/v1/player/991478/heatmap/overall",
    "file": "assets/heatmaps/991478.png"
  },
  {
    "player": "Michel Aebischer",
    "id": 850891,
    "url": "https://api.sofascore.app/api/v1/player/850891/heatmap/overall",
    "file": "assets/heatmaps/850891.png"
  },
  {
    "player": "David Affengruber",
    "id": 988672,
    "url": "https://api.sofascore.app/api/v1/player/988672/heatmap/overall",
    "file": "assets/heatmaps/988672.png"
  },
  {
    "player": "Julen Agirrezabala",
    "id": 1014412,
    "url": "https://api.sofascore.app/api/v1/player/1014412/heatmap/overall",
    "file": "assets/heatmaps/1014412.png"
  },
  {
    "player": "Lucien Agoume",
    "id": 960006,
    "url": "https://api.sofascore.app/api/v1/player/960006/heatmap/overall",
    "file": "assets/heatmaps/960006.png"
  },
  {
    "player": "Felix Agu",
    "id": 933398,
    "url": "https://api.sofascore.app/api/v1/player/933398/heatmap/overall",
    "file": "assets/heatmaps/933398.png"
  },
  {
    "player": "Diego Aguado",
    "id": 1614687,
    "url": "https://api.sofascore.app/api/v1/player/1614687/heatmap/overall",
    "file": "assets/heatmaps/1614687.png"
  },
  {
    "player": "Marc Aguado",
    "id": 1014595,
    "url": "https://api.sofascore.app/api/v1/player/1014595/heatmap/overall",
    "file": "assets/heatmaps/1014595.png"
  },
  {
    "player": "Pablo Agudín",
    "id": 1587199,
    "url": "https://api.sofascore.app/api/v1/player/1587199/heatmap/overall",
    "file": "assets/heatmaps/1587199.png"
  },
  {
    "player": "Ruben Aguilar",
    "id": 579576,
    "url": "https://api.sofascore.app/api/v1/player/579576/heatmap/overall",
    "file": "assets/heatmaps/579576.png"
  },
  {
    "player": "Naouirou Ahamada",
    "id": 997104,
    "url": "https://api.sofascore.app/api/v1/player/997104/heatmap/overall",
    "file": "assets/heatmaps/997104.png"
  },
  {
    "player": "Honest Ahanor",
    "id": 1634980,
    "url": "https://api.sofascore.app/api/v1/player/1634980/heatmap/overall",
    "file": "assets/heatmaps/1634980.png"
  },
  {
    "player": "Lucas Ahijado",
    "id": 597876,
    "url": "https://api.sofascore.app/api/v1/player/597876/heatmap/overall",
    "file": "assets/heatmaps/597876.png"
  },
  {
    "player": "Joseph Aidoo",
    "id": 796320,
    "url": "https://api.sofascore.app/api/v1/player/796320/heatmap/overall",
    "file": "assets/heatmaps/796320.png"
  },
  {
    "player": "Ola Aina",
    "id": 800417,
    "url": "https://api.sofascore.app/api/v1/player/800417/heatmap/overall",
    "file": "assets/heatmaps/800417.png"
  },
  {
    "player": "Abdelhamid Ait Boudlal",
    "id": 1597145,
    "url": "https://api.sofascore.app/api/v1/player/1597145/heatmap/overall",
    "file": "assets/heatmaps/1597145.png"
  },
  {
    "player": "Rayan Aït-Nouri",
    "id": 931278,
    "url": "https://api.sofascore.app/api/v1/player/931278/heatmap/overall",
    "file": "assets/heatmaps/931278.png"
  },
  {
    "player": "Tosin Aiyegun",
    "id": 875548,
    "url": "https://api.sofascore.app/api/v1/player/875548/heatmap/overall",
    "file": "assets/heatmaps/875548.png"
  },
  {
    "player": "Junior Ajayi",
    "id": 1474846,
    "url": "https://api.sofascore.app/api/v1/player/1474846/heatmap/overall",
    "file": "assets/heatmaps/1474846.png"
  },
  {
    "player": "Kristoffer Ajer",
    "id": 576384,
    "url": "https://api.sofascore.app/api/v1/player/576384/heatmap/overall",
    "file": "assets/heatmaps/576384.png"
  },
  {
    "player": "Ludovic Ajorque",
    "id": 343971,
    "url": "https://api.sofascore.app/api/v1/player/343971/heatmap/overall",
    "file": "assets/heatmaps/343971.png"
  },
  {
    "player": "Manuel Akanji",
    "id": 383560,
    "url": "https://api.sofascore.app/api/v1/player/383560/heatmap/overall",
    "file": "assets/heatmaps/383560.png"
  },
  {
    "player": "Nathan Aké",
    "id": 149663,
    "url": "https://api.sofascore.app/api/v1/player/149663/heatmap/overall",
    "file": "assets/heatmaps/149663.png"
  },
  {
    "player": "Ilias Akhomach",
    "id": 1089108,
    "url": "https://api.sofascore.app/api/v1/player/1089108/heatmap/overall",
    "file": "assets/heatmaps/1089108.png"
  },
  {
    "player": "Ebenezer Akinsanmiro",
    "id": 1525367,
    "url": "https://api.sofascore.app/api/v1/player/1525367/heatmap/overall",
    "file": "assets/heatmaps/1525367.png"
  },
  {
    "player": "Maghnes Akliouche",
    "id": 1130939,
    "url": "https://api.sofascore.app/api/v1/player/1130939/heatmap/overall",
    "file": "assets/heatmaps/1130939.png"
  },
  {
    "player": "Clément Akpa",
    "id": 1387156,
    "url": "https://api.sofascore.app/api/v1/player/1387156/heatmap/overall",
    "file": "assets/heatmaps/1387156.png"
  },
  {
    "player": "Jean-Daniel Akpa-Akpro",
    "id": 164511,
    "url": "https://api.sofascore.app/api/v1/player/164511/heatmap/overall",
    "file": "assets/heatmaps/164511.png"
  },
  {
    "player": "Kevin Akpoguma",
    "id": 187423,
    "url": "https://api.sofascore.app/api/v1/player/187423/heatmap/overall",
    "file": "assets/heatmaps/187423.png"
  },
  {
    "player": "David Alaba",
    "id": 66492,
    "url": "https://api.sofascore.app/api/v1/player/66492/heatmap/overall",
    "file": "assets/heatmaps/66492.png"
  },
  {
    "player": "Agustín Albarracín",
    "id": 1464187,
    "url": "https://api.sofascore.app/api/v1/player/1464187/heatmap/overall",
    "file": "assets/heatmaps/1464187.png"
  },
  {
    "player": "Raúl Albiol",
    "id": 3041,
    "url": "https://api.sofascore.app/api/v1/player/3041/heatmap/overall",
    "file": "assets/heatmaps/3041.png"
  },
  {
    "player": "Carlos Alcaraz",
    "id": 1017392,
    "url": "https://api.sofascore.app/api/v1/player/1017392/heatmap/overall",
    "file": "assets/heatmaps/1017392.png"
  },
  {
    "player": "Omar Alderete",
    "id": 805137,
    "url": "https://api.sofascore.app/api/v1/player/805137/heatmap/overall",
    "file": "assets/heatmaps/805137.png"
  },
  {
    "player": "Alexandre Alemão",
    "id": 981604,
    "url": "https://api.sofascore.app/api/v1/player/981604/heatmap/overall",
    "file": "assets/heatmaps/981604.png"
  },
  {
    "player": "Carles Aleñá",
    "id": 794937,
    "url": "https://api.sofascore.app/api/v1/player/794937/heatmap/overall",
    "file": "assets/heatmaps/794937.png"
  },
  {
    "player": "Trent Alexander-Arnold",
    "id": 795064,
    "url": "https://api.sofascore.app/api/v1/player/795064/heatmap/overall",
    "file": "assets/heatmaps/795064.png"
  },
  {
    "player": "Mohamed Ali Cho",
    "id": 1063235,
    "url": "https://api.sofascore.app/api/v1/player/1063235/heatmap/overall",
    "file": "assets/heatmaps/1063235.png"
  },
  {
    "player": "Alisson",
    "id": 243609,
    "url": "https://api.sofascore.app/api/v1/player/243609/heatmap/overall",
    "file": "assets/heatmaps/243609.png"
  },
  {
    "player": "Max Alleyne",
    "id": 1168513,
    "url": "https://api.sofascore.app/api/v1/player/1168513/heatmap/overall",
    "file": "assets/heatmaps/1168513.png"
  },
  {
    "player": "Thiago Almada",
    "id": 944660,
    "url": "https://api.sofascore.app/api/v1/player/944660/heatmap/overall",
    "file": "assets/heatmaps/944660.png"
  },
  {
    "player": "Domingos André Ribeiro Almeida",
    "id": 845693,
    "url": "https://api.sofascore.app/api/v1/player/845693/heatmap/overall",
    "file": "assets/heatmaps/845693.png"
  },
  {
    "player": "Pontus Almqvist",
    "id": 856065,
    "url": "https://api.sofascore.app/api/v1/player/856065/heatmap/overall",
    "file": "assets/heatmaps/856065.png"
  },
  {
    "player": "Marcos Alonso",
    "id": 69408,
    "url": "https://api.sofascore.app/api/v1/player/69408/heatmap/overall",
    "file": "assets/heatmaps/69408.png"
  },
  {
    "player": "Sergi Altimira",
    "id": 1137814,
    "url": "https://api.sofascore.app/api/v1/player/1137814/heatmap/overall",
    "file": "assets/heatmaps/1137814.png"
  },
  {
    "player": "Carlos Álvarez",
    "id": 1010656,
    "url": "https://api.sofascore.app/api/v1/player/1010656/heatmap/overall",
    "file": "assets/heatmaps/1010656.png"
  },
  {
    "player": "Hugo Álvarez",
    "id": 1154935,
    "url": "https://api.sofascore.app/api/v1/player/1154935/heatmap/overall",
    "file": "assets/heatmaps/1154935.png"
  },
  {
    "player": "Julián Álvarez",
    "id": 944656,
    "url": "https://api.sofascore.app/api/v1/player/944656/heatmap/overall",
    "file": "assets/heatmaps/944656.png"
  },
  {
    "player": "Ayoube Amaimouni Echghouyab",
    "id": 1898148,
    "url": "https://api.sofascore.app/api/v1/player/1898148/heatmap/overall",
    "file": "assets/heatmaps/1898148.png"
  },
  {
    "player": "Aurele Amenda",
    "id": 999276,
    "url": "https://api.sofascore.app/api/v1/player/999276/heatmap/overall",
    "file": "assets/heatmaps/999276.png"
  },
  {
    "player": "Kelvin Amian",
    "id": 802143,
    "url": "https://api.sofascore.app/api/v1/player/802143/heatmap/overall",
    "file": "assets/heatmaps/802143.png"
  },
  {
    "player": "Mohamed Amine Sbai",
    "id": 1392829,
    "url": "https://api.sofascore.app/api/v1/player/1392829/heatmap/overall",
    "file": "assets/heatmaps/1392829.png"
  },
  {
    "player": "Nadiem Amiri",
    "id": 327755,
    "url": "https://api.sofascore.app/api/v1/player/327755/heatmap/overall",
    "file": "assets/heatmaps/327755.png"
  },
  {
    "player": "Samuel Amo-Ameyaw",
    "id": 1407484,
    "url": "https://api.sofascore.app/api/v1/player/1407484/heatmap/overall",
    "file": "assets/heatmaps/1407484.png"
  },
  {
    "player": "Amorim",
    "id": 1511706,
    "url": "https://api.sofascore.app/api/v1/player/1511706/heatmap/overall",
    "file": "assets/heatmaps/1511706.png"
  },
  {
    "player": "Mathis Amougou",
    "id": 1426224,
    "url": "https://api.sofascore.app/api/v1/player/1426224/heatmap/overall",
    "file": "assets/heatmaps/1426224.png"
  },
  {
    "player": "Mohamed Amoura",
    "id": 1107591,
    "url": "https://api.sofascore.app/api/v1/player/1107591/heatmap/overall",
    "file": "assets/heatmaps/1107591.png"
  },
  {
    "player": "Ethan Ampadu",
    "id": 847097,
    "url": "https://api.sofascore.app/api/v1/player/847097/heatmap/overall",
    "file": "assets/heatmaps/847097.png"
  },
  {
    "player": "Sofyan Amrabat",
    "id": 359272,
    "url": "https://api.sofascore.app/api/v1/player/359272/heatmap/overall",
    "file": "assets/heatmaps/359272.png"
  },
  {
    "player": "Joachim Andersen",
    "id": 362682,
    "url": "https://api.sofascore.app/api/v1/player/362682/heatmap/overall",
    "file": "assets/heatmaps/362682.png"
  },
  {
    "player": "Elliot Anderson",
    "id": 994546,
    "url": "https://api.sofascore.app/api/v1/player/994546/heatmap/overall",
    "file": "assets/heatmaps/994546.png"
  },
  {
    "player": "Tomoya Ando",
    "id": 1125024,
    "url": "https://api.sofascore.app/api/v1/player/1125024/heatmap/overall",
    "file": "assets/heatmaps/1125024.png"
  },
  {
    "player": "Nícolas Andrade",
    "id": 150611,
    "url": "https://api.sofascore.app/api/v1/player/150611/heatmap/overall",
    "file": "assets/heatmaps/150611.png"
  },
  {
    "player": "André",
    "id": 1035996,
    "url": "https://api.sofascore.app/api/v1/player/1035996/heatmap/overall",
    "file": "assets/heatmaps/1035996.png"
  },
  {
    "player": "Benjamin André",
    "id": 51665,
    "url": "https://api.sofascore.app/api/v1/player/51665/heatmap/overall",
    "file": "assets/heatmaps/51665.png"
  },
  {
    "player": "Robert Andrich",
    "id": 168903,
    "url": "https://api.sofascore.app/api/v1/player/168903/heatmap/overall",
    "file": "assets/heatmaps/168903.png"
  },
  {
    "player": "Manuel Ángel",
    "id": 1142683,
    "url": "https://api.sofascore.app/api/v1/player/1142683/heatmap/overall",
    "file": "assets/heatmaps/1142683.png"
  },
  {
    "player": "Miguel Ángel Rubio",
    "id": 934351,
    "url": "https://api.sofascore.app/api/v1/player/934351/heatmap/overall",
    "file": "assets/heatmaps/934351.png"
  },
  {
    "player": "Miguel Ángel Sierra",
    "id": 1518564,
    "url": "https://api.sofascore.app/api/v1/player/1518564/heatmap/overall",
    "file": "assets/heatmaps/1518564.png"
  },
  {
    "player": "Angeliño",
    "id": 848355,
    "url": "https://api.sofascore.app/api/v1/player/848355/heatmap/overall",
    "file": "assets/heatmaps/848355.png"
  },
  {
    "player": "Samuele Angori",
    "id": 1174457,
    "url": "https://api.sofascore.app/api/v1/player/1174457/heatmap/overall",
    "file": "assets/heatmaps/1174457.png"
  },
  {
    "player": "Nilson Angulo",
    "id": 1116571,
    "url": "https://api.sofascore.app/api/v1/player/1116571/heatmap/overall",
    "file": "assets/heatmaps/1116571.png"
  },
  {
    "player": "Faustino Anjorin",
    "id": 907667,
    "url": "https://api.sofascore.app/api/v1/player/907667/heatmap/overall",
    "file": "assets/heatmaps/907667.png"
  },
  {
    "player": "Ilyas Ansah",
    "id": 1462742,
    "url": "https://api.sofascore.app/api/v1/player/1462742/heatmap/overall",
    "file": "assets/heatmaps/1462742.png"
  },
  {
    "player": "Aaron Anselmino",
    "id": 1500263,
    "url": "https://api.sofascore.app/api/v1/player/1500263/heatmap/overall",
    "file": "assets/heatmaps/1500263.png"
  },
  {
    "player": "Andrés Antañón",
    "id": 1916256,
    "url": "https://api.sofascore.app/api/v1/player/1916256/heatmap/overall",
    "file": "assets/heatmaps/1916256.png"
  },
  {
    "player": "Jaidon Anthony",
    "id": 1020680,
    "url": "https://api.sofascore.app/api/v1/player/1020680/heatmap/overall",
    "file": "assets/heatmaps/1020680.png"
  },
  {
    "player": "Waldemar Anton",
    "id": 799046,
    "url": "https://api.sofascore.app/api/v1/player/799046/heatmap/overall",
    "file": "assets/heatmaps/799046.png"
  },
  {
    "player": "Kyllian Antonio",
    "id": 1546405,
    "url": "https://api.sofascore.app/api/v1/player/1546405/heatmap/overall",
    "file": "assets/heatmaps/1546405.png"
  },
  {
    "player": "Antoniu",
    "id": 1099344,
    "url": "https://api.sofascore.app/api/v1/player/1099344/heatmap/overall",
    "file": "assets/heatmaps/1099344.png"
  },
  {
    "player": "Antony",
    "id": 958380,
    "url": "https://api.sofascore.app/api/v1/player/958380/heatmap/overall",
    "file": "assets/heatmaps/958380.png"
  },
  {
    "player": "Youssef El-Arabi",
    "id": 45512,
    "url": "https://api.sofascore.app/api/v1/player/45512/heatmap/overall",
    "file": "assets/heatmaps/45512.png"
  },
  {
    "player": "Mauro Arambarri",
    "id": 385888,
    "url": "https://api.sofascore.app/api/v1/player/385888/heatmap/overall",
    "file": "assets/heatmaps/385888.png"
  },
  {
    "player": "Jon Aramburu",
    "id": 1116388,
    "url": "https://api.sofascore.app/api/v1/player/1116388/heatmap/overall",
    "file": "assets/heatmaps/1116388.png"
  },
  {
    "player": "Juan Arango",
    "id": 1482463,
    "url": "https://api.sofascore.app/api/v1/player/1482463/heatmap/overall",
    "file": "assets/heatmaps/1482463.png"
  },
  {
    "player": "Ronald Araújo",
    "id": 925097,
    "url": "https://api.sofascore.app/api/v1/player/925097/heatmap/overall",
    "file": "assets/heatmaps/925097.png"
  },
  {
    "player": "Carlens Arcus",
    "id": 794373,
    "url": "https://api.sofascore.app/api/v1/player/794373/heatmap/overall",
    "file": "assets/heatmaps/794373.png"
  },
  {
    "player": "Antonio Arena",
    "id": 1923599,
    "url": "https://api.sofascore.app/api/v1/player/1923599/heatmap/overall",
    "file": "assets/heatmaps/1923599.png"
  },
  {
    "player": "Alphonse Areola",
    "id": 96531,
    "url": "https://api.sofascore.app/api/v1/player/96531/heatmap/overall",
    "file": "assets/heatmaps/96531.png"
  },
  {
    "player": "Jesús Areso",
    "id": 910267,
    "url": "https://api.sofascore.app/api/v1/player/910267/heatmap/overall",
    "file": "assets/heatmaps/910267.png"
  },
  {
    "player": "Jeremy Arévalo",
    "id": 1464642,
    "url": "https://api.sofascore.app/api/v1/player/1464642/heatmap/overall",
    "file": "assets/heatmaps/1464642.png"
  },
  {
    "player": "Paul Argney",
    "id": 1426218,
    "url": "https://api.sofascore.app/api/v1/player/1426218/heatmap/overall",
    "file": "assets/heatmaps/1426218.png"
  },
  {
    "player": "Iñigo Arguibide",
    "id": 1495856,
    "url": "https://api.sofascore.app/api/v1/player/1495856/heatmap/overall",
    "file": "assets/heatmaps/1495856.png"
  },
  {
    "player": "Juan Arizala",
    "id": 1476922,
    "url": "https://api.sofascore.app/api/v1/player/1476922/heatmap/overall",
    "file": "assets/heatmaps/1476922.png"
  },
  {
    "player": "Adam Armstrong",
    "id": 361352,
    "url": "https://api.sofascore.app/api/v1/player/361352/heatmap/overall",
    "file": "assets/heatmaps/361352.png"
  },
  {
    "player": "Harrison Armstrong",
    "id": 1627560,
    "url": "https://api.sofascore.app/api/v1/player/1627560/heatmap/overall",
    "file": "assets/heatmaps/1627560.png"
  },
  {
    "player": "Maximilian Arnold",
    "id": 147289,
    "url": "https://api.sofascore.app/api/v1/player/147289/heatmap/overall",
    "file": "assets/heatmaps/147289.png"
  },
  {
    "player": "Tolu Arokodare",
    "id": 987734,
    "url": "https://api.sofascore.app/api/v1/player/987734/heatmap/overall",
    "file": "assets/heatmaps/987734.png"
  },
  {
    "player": "Love Arrhov",
    "id": 1977245,
    "url": "https://api.sofascore.app/api/v1/player/1977245/heatmap/overall",
    "file": "assets/heatmaps/1977245.png"
  },
  {
    "player": "Kervin Arriaga",
    "id": 1083832,
    "url": "https://api.sofascore.app/api/v1/player/1083832/heatmap/overall",
    "file": "assets/heatmaps/1083832.png"
  },
  {
    "player": "Arthur",
    "id": 1174761,
    "url": "https://api.sofascore.app/api/v1/player/1174761/heatmap/overall",
    "file": "assets/heatmaps/1174761.png"
  },
  {
    "player": "Takuma Asano",
    "id": 309546,
    "url": "https://api.sofascore.app/api/v1/player/309546/heatmap/overall",
    "file": "assets/heatmaps/309546.png"
  },
  {
    "player": "Raúl Asencio",
    "id": 1156645,
    "url": "https://api.sofascore.app/api/v1/player/1156645/heatmap/overall",
    "file": "assets/heatmaps/1156645.png"
  },
  {
    "player": "Fisnik Asllani",
    "id": 1010117,
    "url": "https://api.sofascore.app/api/v1/player/1010117/heatmap/overall",
    "file": "assets/heatmaps/1010117.png"
  },
  {
    "player": "Iago Aspas",
    "id": 19356,
    "url": "https://api.sofascore.app/api/v1/player/19356/heatmap/overall",
    "file": "assets/heatmaps/19356.png"
  },
  {
    "player": "Lorenz Assignon",
    "id": 1009334,
    "url": "https://api.sofascore.app/api/v1/player/1009334/heatmap/overall",
    "file": "assets/heatmaps/1009334.png"
  },
  {
    "player": "Lander Astiazaran",
    "id": 1535581,
    "url": "https://api.sofascore.app/api/v1/player/1535581/heatmap/overall",
    "file": "assets/heatmaps/1535581.png"
  },
  {
    "player": "Zachary Athekame",
    "id": 1409700,
    "url": "https://api.sofascore.app/api/v1/player/1409700/heatmap/overall",
    "file": "assets/heatmaps/1409700.png"
  },
  {
    "player": "Arthur Atta",
    "id": 1444690,
    "url": "https://api.sofascore.app/api/v1/player/1444690/heatmap/overall",
    "file": "assets/heatmaps/1444690.png"
  },
  {
    "player": "Noah Atubolu",
    "id": 980626,
    "url": "https://api.sofascore.app/api/v1/player/980626/heatmap/overall",
    "file": "assets/heatmaps/980626.png"
  },
  {
    "player": "Pierre-Emerick Aubameyang",
    "id": 51498,
    "url": "https://api.sofascore.app/api/v1/player/51498/heatmap/overall",
    "file": "assets/heatmaps/51498.png"
  },
  {
    "player": "Emil Audero",
    "id": 318603,
    "url": "https://api.sofascore.app/api/v1/player/318603/heatmap/overall",
    "file": "assets/heatmaps/318603.png"
  },
  {
    "player": "Carlos Augusto",
    "id": 929199,
    "url": "https://api.sofascore.app/api/v1/player/929199/heatmap/overall",
    "file": "assets/heatmaps/929199.png"
  },
  {
    "player": "Yann Aurel Bisseck",
    "id": 906275,
    "url": "https://api.sofascore.app/api/v1/player/906275/heatmap/overall",
    "file": "assets/heatmaps/906275.png"
  },
  {
    "player": "Leon Avdullahu",
    "id": 1493305,
    "url": "https://api.sofascore.app/api/v1/player/1493305/heatmap/overall",
    "file": "assets/heatmaps/1493305.png"
  },
  {
    "player": "Arthur Avom",
    "id": 1465307,
    "url": "https://api.sofascore.app/api/v1/player/1465307/heatmap/overall",
    "file": "assets/heatmaps/1465307.png"
  },
  {
    "player": "Chidozie Awaziem",
    "id": 804764,
    "url": "https://api.sofascore.app/api/v1/player/804764/heatmap/overall",
    "file": "assets/heatmaps/804764.png"
  },
  {
    "player": "Taiwo Awoniyi",
    "id": 359664,
    "url": "https://api.sofascore.app/api/v1/player/359664/heatmap/overall",
    "file": "assets/heatmaps/359664.png"
  },
  {
    "player": "Yasin Ayari",
    "id": 1036269,
    "url": "https://api.sofascore.app/api/v1/player/1036269/heatmap/overall",
    "file": "assets/heatmaps/1036269.png"
  },
  {
    "player": "Neil El Aynaoui",
    "id": 1128530,
    "url": "https://api.sofascore.app/api/v1/player/1128530/heatmap/overall",
    "file": "assets/heatmaps/1128530.png"
  },
  {
    "player": "César Azpilicueta",
    "id": 21555,
    "url": "https://api.sofascore.app/api/v1/player/21555/heatmap/overall",
    "file": "assets/heatmaps/21555.png"
  },
  {
    "player": "Oussama El Azzouzi",
    "id": 1127191,
    "url": "https://api.sofascore.app/api/v1/player/1127191/heatmap/overall",
    "file": "assets/heatmaps/1127191.png"
  },
  {
    "player": "Mio Backhaus",
    "id": 1083390,
    "url": "https://api.sofascore.app/api/v1/player/1083390/heatmap/overall",
    "file": "assets/heatmaps/1083390.png"
  },
  {
    "player": "Loïc Bade",
    "id": 1006489,
    "url": "https://api.sofascore.app/api/v1/player/1006489/heatmap/overall",
    "file": "assets/heatmaps/1006489.png"
  },
  {
    "player": "Benoît Badiashile",
    "id": 904827,
    "url": "https://api.sofascore.app/api/v1/player/904827/heatmap/overall",
    "file": "assets/heatmaps/904827.png"
  },
  {
    "player": "Samson Baidoo",
    "id": 1099117,
    "url": "https://api.sofascore.app/api/v1/player/1099117/heatmap/overall",
    "file": "assets/heatmaps/1099117.png"
  },
  {
    "player": "Eric Bailly",
    "id": 606346,
    "url": "https://api.sofascore.app/api/v1/player/606346/heatmap/overall",
    "file": "assets/heatmaps/606346.png"
  },
  {
    "player": "Cédric Bakambu",
    "id": 115665,
    "url": "https://api.sofascore.app/api/v1/player/115665/heatmap/overall",
    "file": "assets/heatmaps/115665.png"
  },
  {
    "player": "Johan Bakayoko",
    "id": 1088896,
    "url": "https://api.sofascore.app/api/v1/player/1088896/heatmap/overall",
    "file": "assets/heatmaps/1088896.png"
  },
  {
    "player": "Darryl Bakola",
    "id": 1823916,
    "url": "https://api.sofascore.app/api/v1/player/1823916/heatmap/overall",
    "file": "assets/heatmaps/1823916.png"
  },
  {
    "player": "Ridle Baku",
    "id": 856553,
    "url": "https://api.sofascore.app/api/v1/player/856553/heatmap/overall",
    "file": "assets/heatmaps/856553.png"
  },
  {
    "player": "Dilane Bakwa",
    "id": 963298,
    "url": "https://api.sofascore.app/api/v1/player/963298/heatmap/overall",
    "file": "assets/heatmaps/963298.png"
  },
  {
    "player": "Alejandro Balde",
    "id": 997035,
    "url": "https://api.sofascore.app/api/v1/player/997035/heatmap/overall",
    "file": "assets/heatmaps/997035.png"
  },
  {
    "player": "Fabio Baldé",
    "id": 1546267,
    "url": "https://api.sofascore.app/api/v1/player/1546267/heatmap/overall",
    "file": "assets/heatmaps/1546267.png"
  },
  {
    "player": "Carlos Baleba",
    "id": 1199043,
    "url": "https://api.sofascore.app/api/v1/player/1199043/heatmap/overall",
    "file": "assets/heatmaps/1199043.png"
  },
  {
    "player": "Leonardo Balerdi",
    "id": 928236,
    "url": "https://api.sofascore.app/api/v1/player/928236/heatmap/overall",
    "file": "assets/heatmaps/928236.png"
  },
  {
    "player": "Daniel Ballard",
    "id": 958878,
    "url": "https://api.sofascore.app/api/v1/player/958878/heatmap/overall",
    "file": "assets/heatmaps/958878.png"
  },
  {
    "player": "Carlos Ballestero",
    "id": 1402936,
    "url": "https://api.sofascore.app/api/v1/player/1402936/heatmap/overall",
    "file": "assets/heatmaps/1402936.png"
  },
  {
    "player": "Iván Balliu",
    "id": 152446,
    "url": "https://api.sofascore.app/api/v1/player/152446/heatmap/overall",
    "file": "assets/heatmaps/152446.png"
  },
  {
    "player": "Fodé Ballo-Touré",
    "id": 788170,
    "url": "https://api.sofascore.app/api/v1/player/788170/heatmap/overall",
    "file": "assets/heatmaps/788170.png"
  },
  {
    "player": "Folarin Balogun",
    "id": 934237,
    "url": "https://api.sofascore.app/api/v1/player/934237/heatmap/overall",
    "file": "assets/heatmaps/934237.png"
  },
  {
    "player": "Abdoulaye Bamba",
    "id": 121180,
    "url": "https://api.sofascore.app/api/v1/player/121180/heatmap/overall",
    "file": "assets/heatmaps/121180.png"
  },
  {
    "player": "Aladji Bamba",
    "id": 1868591,
    "url": "https://api.sofascore.app/api/v1/player/1868591/heatmap/overall",
    "file": "assets/heatmaps/1868591.png"
  },
  {
    "player": "Mohamed Bamba",
    "id": 1405239,
    "url": "https://api.sofascore.app/api/v1/player/1405239/heatmap/overall",
    "file": "assets/heatmaps/1405239.png"
  },
  {
    "player": "Lameck Banda",
    "id": 911350,
    "url": "https://api.sofascore.app/api/v1/player/911350/heatmap/overall",
    "file": "assets/heatmaps/911350.png"
  },
  {
    "player": "Noahkai Banks",
    "id": 1597260,
    "url": "https://api.sofascore.app/api/v1/player/1597260/heatmap/overall",
    "file": "assets/heatmaps/1597260.png"
  },
  {
    "player": "Ezechiel Banzuzi",
    "id": 1155383,
    "url": "https://api.sofascore.app/api/v1/player/1155383/heatmap/overall",
    "file": "assets/heatmaps/1155383.png"
  },
  {
    "player": "Tommaso Barbieri",
    "id": 993389,
    "url": "https://api.sofascore.app/api/v1/player/993389/heatmap/overall",
    "file": "assets/heatmaps/993389.png"
  },
  {
    "player": "Valentín Barco",
    "id": 1127057,
    "url": "https://api.sofascore.app/api/v1/player/1127057/heatmap/overall",
    "file": "assets/heatmaps/1127057.png"
  },
  {
    "player": "Bradley Barcola",
    "id": 996952,
    "url": "https://api.sofascore.app/api/v1/player/996952/heatmap/overall",
    "file": "assets/heatmaps/996952.png"
  },
  {
    "player": "Melvin Bard",
    "id": 906075,
    "url": "https://api.sofascore.app/api/v1/player/906075/heatmap/overall",
    "file": "assets/heatmaps/906075.png"
  },
  {
    "player": "Roony Bardghji",
    "id": 1162107,
    "url": "https://api.sofascore.app/api/v1/player/1162107/heatmap/overall",
    "file": "assets/heatmaps/1162107.png"
  },
  {
    "player": "Nicolò Barella",
    "id": 363856,
    "url": "https://api.sofascore.app/api/v1/player/363856/heatmap/overall",
    "file": "assets/heatmaps/363856.png"
  },
  {
    "player": "Kike Barja",
    "id": 591132,
    "url": "https://api.sofascore.app/api/v1/player/591132/heatmap/overall",
    "file": "assets/heatmaps/591132.png"
  },
  {
    "player": "Ross Barkley",
    "id": 98435,
    "url": "https://api.sofascore.app/api/v1/player/98435/heatmap/overall",
    "file": "assets/heatmaps/98435.png"
  },
  {
    "player": "Ashley Barnes",
    "id": 27028,
    "url": "https://api.sofascore.app/api/v1/player/27028/heatmap/overall",
    "file": "assets/heatmaps/27028.png"
  },
  {
    "player": "Harvey Barnes",
    "id": 855647,
    "url": "https://api.sofascore.app/api/v1/player/855647/heatmap/overall",
    "file": "assets/heatmaps/855647.png"
  },
  {
    "player": "Ander Barrenetxea",
    "id": 966862,
    "url": "https://api.sofascore.app/api/v1/player/966862/heatmap/overall",
    "file": "assets/heatmaps/966862.png"
  },
  {
    "player": "Pablo Barrios",
    "id": 1142588,
    "url": "https://api.sofascore.app/api/v1/player/1142588/heatmap/overall",
    "file": "assets/heatmaps/1142588.png"
  },
  {
    "player": "Thierno Barry",
    "id": 1395746,
    "url": "https://api.sofascore.app/api/v1/player/1395746/heatmap/overall",
    "file": "assets/heatmaps/1395746.png"
  },
  {
    "player": "Davide Bartesaghi",
    "id": 1390489,
    "url": "https://api.sofascore.app/api/v1/player/1390489/heatmap/overall",
    "file": "assets/heatmaps/1390489.png"
  },
  {
    "player": "Marc Bartra",
    "id": 99519,
    "url": "https://api.sofascore.app/api/v1/player/99519/heatmap/overall",
    "file": "assets/heatmaps/99519.png"
  },
  {
    "player": "Federico Baschirotto",
    "id": 786175,
    "url": "https://api.sofascore.app/api/v1/player/786175/heatmap/overall",
    "file": "assets/heatmaps/786175.png"
  },
  {
    "player": "Toma Bašić",
    "id": 798002,
    "url": "https://api.sofascore.app/api/v1/player/798002/heatmap/overall",
    "file": "assets/heatmaps/798002.png"
  },
  {
    "player": "Calvin Bassey",
    "id": 861972,
    "url": "https://api.sofascore.app/api/v1/player/861972/heatmap/overall",
    "file": "assets/heatmaps/861972.png"
  },
  {
    "player": "Alessandro Bastoni",
    "id": 826188,
    "url": "https://api.sofascore.app/api/v1/player/826188/heatmap/overall",
    "file": "assets/heatmaps/826188.png"
  },
  {
    "player": "Augusto Batalla",
    "id": 358910,
    "url": "https://api.sofascore.app/api/v1/player/358910/heatmap/overall",
    "file": "assets/heatmaps/358910.png"
  },
  {
    "player": "Michy Batshuayi",
    "id": 147745,
    "url": "https://api.sofascore.app/api/v1/player/147745/heatmap/overall",
    "file": "assets/heatmaps/147745.png"
  },
  {
    "player": "Martin Baturina",
    "id": 1090019,
    "url": "https://api.sofascore.app/api/v1/player/1090019/heatmap/overall",
    "file": "assets/heatmaps/1090019.png"
  },
  {
    "player": "Daniel Batz",
    "id": 94312,
    "url": "https://api.sofascore.app/api/v1/player/94312/heatmap/overall",
    "file": "assets/heatmaps/94312.png"
  },
  {
    "player": "Elias Baum",
    "id": 1403018,
    "url": "https://api.sofascore.app/api/v1/player/1403018/heatmap/overall",
    "file": "assets/heatmaps/1403018.png"
  },
  {
    "player": "Oliver Baumann",
    "id": 40244,
    "url": "https://api.sofascore.app/api/v1/player/40244/heatmap/overall",
    "file": "assets/heatmaps/40244.png"
  },
  {
    "player": "Christoph Baumgartner",
    "id": 825956,
    "url": "https://api.sofascore.app/api/v1/player/825956/heatmap/overall",
    "file": "assets/heatmaps/825956.png"
  },
  {
    "player": "Altay Bayındır",
    "id": 815890,
    "url": "https://api.sofascore.app/api/v1/player/815890/heatmap/overall",
    "file": "assets/heatmaps/815890.png"
  },
  {
    "player": "Vakoun Bayo",
    "id": 796455,
    "url": "https://api.sofascore.app/api/v1/player/796455/heatmap/overall",
    "file": "assets/heatmaps/796455.png"
  },
  {
    "player": "Ihlas Bebou",
    "id": 254297,
    "url": "https://api.sofascore.app/api/v1/player/254297/heatmap/overall",
    "file": "assets/heatmaps/254297.png"
  },
  {
    "player": "Samu Becerra",
    "id": 2198232,
    "url": "https://api.sofascore.app/api/v1/player/2198232/heatmap/overall",
    "file": "assets/heatmaps/2198232.png"
  },
  {
    "player": "Adrian Beck",
    "id": 845742,
    "url": "https://api.sofascore.app/api/v1/player/845742/heatmap/overall",
    "file": "assets/heatmaps/845742.png"
  },
  {
    "player": "Sheraldo Becker",
    "id": 352544,
    "url": "https://api.sofascore.app/api/v1/player/352544/heatmap/overall",
    "file": "assets/heatmaps/352544.png"
  },
  {
    "player": "Donny van de Beek",
    "id": 361790,
    "url": "https://api.sofascore.app/api/v1/player/361790/heatmap/overall",
    "file": "assets/heatmaps/361790.png"
  },
  {
    "player": "Hannes Behrens",
    "id": 1864760,
    "url": "https://api.sofascore.app/api/v1/player/1864760/heatmap/overall",
    "file": "assets/heatmaps/1864760.png"
  },
  {
    "player": "Maximilian Beier",
    "id": 980628,
    "url": "https://api.sofascore.app/api/v1/player/980628/heatmap/overall",
    "file": "assets/heatmaps/980628.png"
  },
  {
    "player": "Ismael Bekhoucha",
    "id": 1895964,
    "url": "https://api.sofascore.app/api/v1/player/1895964/heatmap/overall",
    "file": "assets/heatmaps/1895964.png"
  },
  {
    "player": "Reda Belahyane",
    "id": 1389689,
    "url": "https://api.sofascore.app/api/v1/player/1389689/heatmap/overall",
    "file": "assets/heatmaps/1389689.png"
  },
  {
    "player": "Rafik Belghali",
    "id": 1103488,
    "url": "https://api.sofascore.app/api/v1/player/1103488/heatmap/overall",
    "file": "assets/heatmaps/1103488.png"
  },
  {
    "player": "Haris Belkebla",
    "id": 580642,
    "url": "https://api.sofascore.app/api/v1/player/580642/heatmap/overall",
    "file": "assets/heatmaps/580642.png"
  },
  {
    "player": "Yassin Belkhdim",
    "id": 1195241,
    "url": "https://api.sofascore.app/api/v1/player/1195241/heatmap/overall",
    "file": "assets/heatmaps/1195241.png"
  },
  {
    "player": "Stefan Bell",
    "id": 106662,
    "url": "https://api.sofascore.app/api/v1/player/106662/heatmap/overall",
    "file": "assets/heatmaps/106662.png"
  },
  {
    "player": "Armel Bella Kotchap",
    "id": 976025,
    "url": "https://api.sofascore.app/api/v1/player/976025/heatmap/overall",
    "file": "assets/heatmaps/976025.png"
  },
  {
    "player": "Raoul Bellanova",
    "id": 826185,
    "url": "https://api.sofascore.app/api/v1/player/826185/heatmap/overall",
    "file": "assets/heatmaps/826185.png"
  },
  {
    "player": "Jean-Ricner Bellegarde",
    "id": 845273,
    "url": "https://api.sofascore.app/api/v1/player/845273/heatmap/overall",
    "file": "assets/heatmaps/845273.png"
  },
  {
    "player": "Héctor Bellerín",
    "id": 188365,
    "url": "https://api.sofascore.app/api/v1/player/188365/heatmap/overall",
    "file": "assets/heatmaps/188365.png"
  },
  {
    "player": "Jobe Bellingham",
    "id": 1134083,
    "url": "https://api.sofascore.app/api/v1/player/1134083/heatmap/overall",
    "file": "assets/heatmaps/1134083.png"
  },
  {
    "player": "Jude Bellingham",
    "id": 991011,
    "url": "https://api.sofascore.app/api/v1/player/991011/heatmap/overall",
    "file": "assets/heatmaps/991011.png"
  },
  {
    "player": "Andrea Belotti",
    "id": 220223,
    "url": "https://api.sofascore.app/api/v1/player/220223/heatmap/overall",
    "file": "assets/heatmaps/220223.png"
  },
  {
    "player": "Lucas Beltrán",
    "id": 962029,
    "url": "https://api.sofascore.app/api/v1/player/962029/heatmap/overall",
    "file": "assets/heatmaps/962029.png"
  },
  {
    "player": "Eliesse Ben Seghir",
    "id": 1394353,
    "url": "https://api.sofascore.app/api/v1/player/1394353/heatmap/overall",
    "file": "assets/heatmaps/1394353.png"
  },
  {
    "player": "Carlos Benavídez",
    "id": 873717,
    "url": "https://api.sofascore.app/api/v1/player/873717/heatmap/overall",
    "file": "assets/heatmaps/873717.png"
  },
  {
    "player": "Walter Benítez",
    "id": 249859,
    "url": "https://api.sofascore.app/api/v1/player/249859/heatmap/overall",
    "file": "assets/heatmaps/249859.png"
  },
  {
    "player": "Iker Benito",
    "id": 1086346,
    "url": "https://api.sofascore.app/api/v1/player/1086346/heatmap/overall",
    "file": "assets/heatmaps/1086346.png"
  },
  {
    "player": "Ramy Bensebaini",
    "id": 577726,
    "url": "https://api.sofascore.app/api/v1/player/577726/heatmap/overall",
    "file": "assets/heatmaps/577726.png"
  },
  {
    "player": "Nabil Bentaleb",
    "id": 368120,
    "url": "https://api.sofascore.app/api/v1/player/368120/heatmap/overall",
    "file": "assets/heatmaps/368120.png"
  },
  {
    "player": "Rodrigo Bentancur",
    "id": 791190,
    "url": "https://api.sofascore.app/api/v1/player/791190/heatmap/overall",
    "file": "assets/heatmaps/791190.png"
  },
  {
    "player": "Lucas Beraldo",
    "id": 1108441,
    "url": "https://api.sofascore.app/api/v1/player/1108441/heatmap/overall",
    "file": "assets/heatmaps/1108441.png"
  },
  {
    "player": "Domenico Berardi",
    "id": 253367,
    "url": "https://api.sofascore.app/api/v1/player/253367/heatmap/overall",
    "file": "assets/heatmaps/253367.png"
  },
  {
    "player": "Yuri Berchiche",
    "id": 84531,
    "url": "https://api.sofascore.app/api/v1/player/84531/heatmap/overall",
    "file": "assets/heatmaps/84531.png"
  },
  {
    "player": "Álex Berenguer",
    "id": 592012,
    "url": "https://api.sofascore.app/api/v1/player/592012/heatmap/overall",
    "file": "assets/heatmaps/592012.png"
  },
  {
    "player": "Sander Berge",
    "id": 793167,
    "url": "https://api.sofascore.app/api/v1/player/793167/heatmap/overall",
    "file": "assets/heatmaps/793167.png"
  },
  {
    "player": "Lucas Bergström",
    "id": 996903,
    "url": "https://api.sofascore.app/api/v1/player/996903/heatmap/overall",
    "file": "assets/heatmaps/996903.png"
  },
  {
    "player": "Lucas Bergvall",
    "id": 1391251,
    "url": "https://api.sofascore.app/api/v1/player/1391251/heatmap/overall",
    "file": "assets/heatmaps/1391251.png"
  },
  {
    "player": "Medon Berisha",
    "id": 1142149,
    "url": "https://api.sofascore.app/api/v1/player/1142149/heatmap/overall",
    "file": "assets/heatmaps/1142149.png"
  },
  {
    "player": "Anthony Bermont",
    "id": 1545297,
    "url": "https://api.sofascore.app/api/v1/player/1545297/heatmap/overall",
    "file": "assets/heatmaps/1545297.png"
  },
  {
    "player": "Adrian Bernabe",
    "id": 934384,
    "url": "https://api.sofascore.app/api/v1/player/934384/heatmap/overall",
    "file": "assets/heatmaps/934384.png"
  },
  {
    "player": "Marc Bernal",
    "id": 1526618,
    "url": "https://api.sofascore.app/api/v1/player/1526618/heatmap/overall",
    "file": "assets/heatmaps/1526618.png"
  },
  {
    "player": "Gabin Bernardeau",
    "id": 1893993,
    "url": "https://api.sofascore.app/api/v1/player/1893993/heatmap/overall",
    "file": "assets/heatmaps/1893993.png"
  },
  {
    "player": "Federico Bernardeschi",
    "id": 294597,
    "url": "https://api.sofascore.app/api/v1/player/294597/heatmap/overall",
    "file": "assets/heatmaps/294597.png"
  },
  {
    "player": "Bernardo",
    "id": 828571,
    "url": "https://api.sofascore.app/api/v1/player/828571/heatmap/overall",
    "file": "assets/heatmaps/828571.png"
  },
  {
    "player": "Antoine Bernede",
    "id": 837080,
    "url": "https://api.sofascore.app/api/v1/player/837080/heatmap/overall",
    "file": "assets/heatmaps/837080.png"
  },
  {
    "player": "Nicolò Bertola",
    "id": 1136399,
    "url": "https://api.sofascore.app/api/v1/player/1136399/heatmap/overall",
    "file": "assets/heatmaps/1136399.png"
  },
  {
    "player": "Jan-Niklas Beste",
    "id": 836711,
    "url": "https://api.sofascore.app/api/v1/player/836711/heatmap/overall",
    "file": "assets/heatmaps/836711.png"
  },
  {
    "player": "Beto",
    "id": 987489,
    "url": "https://api.sofascore.app/api/v1/player/987489/heatmap/overall",
    "file": "assets/heatmaps/987489.png"
  },
  {
    "player": "Sam Beukema",
    "id": 898815,
    "url": "https://api.sofascore.app/api/v1/player/898815/heatmap/overall",
    "file": "assets/heatmaps/898815.png"
  },
  {
    "player": "Matteo Bianchetti",
    "id": 158037,
    "url": "https://api.sofascore.app/api/v1/player/158037/heatmap/overall",
    "file": "assets/heatmaps/158037.png"
  },
  {
    "player": "Mika Biereth",
    "id": 1083007,
    "url": "https://api.sofascore.app/api/v1/player/1083007/heatmap/overall",
    "file": "assets/heatmaps/1083007.png"
  },
  {
    "player": "Pedro Bigas",
    "id": 141832,
    "url": "https://api.sofascore.app/api/v1/player/141832/heatmap/overall",
    "file": "assets/heatmaps/141832.png"
  },
  {
    "player": "Justin Bijlow",
    "id": 556696,
    "url": "https://api.sofascore.app/api/v1/player/556696/heatmap/overall",
    "file": "assets/heatmaps/556696.png"
  },
  {
    "player": "Jaka Bijol",
    "id": 886930,
    "url": "https://api.sofascore.app/api/v1/player/886930/heatmap/overall",
    "file": "assets/heatmaps/886930.png"
  },
  {
    "player": "Cristiano Biraghi",
    "id": 122848,
    "url": "https://api.sofascore.app/api/v1/player/122848/heatmap/overall",
    "file": "assets/heatmaps/122848.png"
  },
  {
    "player": "Veljko Birmančević",
    "id": 831510,
    "url": "https://api.sofascore.app/api/v1/player/831510/heatmap/overall",
    "file": "assets/heatmaps/831510.png"
  },
  {
    "player": "Tom Bischof",
    "id": 1129935,
    "url": "https://api.sofascore.app/api/v1/player/1129935/heatmap/overall",
    "file": "assets/heatmaps/1129935.png"
  },
  {
    "player": "Yves Bissouma",
    "id": 844842,
    "url": "https://api.sofascore.app/api/v1/player/844842/heatmap/overall",
    "file": "assets/heatmaps/844842.png"
  },
  {
    "player": "Leonardo Bittencourt",
    "id": 111969,
    "url": "https://api.sofascore.app/api/v1/player/111969/heatmap/overall",
    "file": "assets/heatmaps/111969.png"
  },
  {
    "player": "Emmanuel Biumla",
    "id": 1442036,
    "url": "https://api.sofascore.app/api/v1/player/1442036/heatmap/overall",
    "file": "assets/heatmaps/1442036.png"
  },
  {
    "player": "Marco Bizot",
    "id": 100390,
    "url": "https://api.sofascore.app/api/v1/player/100390/heatmap/overall",
    "file": "assets/heatmaps/100390.png"
  },
  {
    "player": "Antonio Blanco",
    "id": 855832,
    "url": "https://api.sofascore.app/api/v1/player/855832/heatmap/overall",
    "file": "assets/heatmaps/855832.png"
  },
  {
    "player": "Ludovic Blas",
    "id": 806076,
    "url": "https://api.sofascore.app/api/v1/player/806076/heatmap/overall",
    "file": "assets/heatmaps/806076.png"
  },
  {
    "player": "Janis Blaswich",
    "id": 96832,
    "url": "https://api.sofascore.app/api/v1/player/96832/heatmap/overall",
    "file": "assets/heatmaps/96832.png"
  },
  {
    "player": "Daley Blind",
    "id": 44864,
    "url": "https://api.sofascore.app/api/v1/player/44864/heatmap/overall",
    "file": "assets/heatmaps/44864.png"
  },
  {
    "player": "Adam Boayar",
    "id": 1518971,
    "url": "https://api.sofascore.app/api/v1/player/1518971/heatmap/overall",
    "file": "assets/heatmaps/1518971.png"
  },
  {
    "player": "Oscar Bobb",
    "id": 1065216,
    "url": "https://api.sofascore.app/api/v1/player/1065216/heatmap/overall",
    "file": "assets/heatmaps/1065216.png"
  },
  {
    "player": "Arnaud Bodart",
    "id": 878898,
    "url": "https://api.sofascore.app/api/v1/player/878898/heatmap/overall",
    "file": "assets/heatmaps/878898.png"
  },
  {
    "player": "Jeremie Boga",
    "id": 367056,
    "url": "https://api.sofascore.app/api/v1/player/367056/heatmap/overall",
    "file": "assets/heatmaps/367056.png"
  },
  {
    "player": "Lamare Bogarde",
    "id": 1089388,
    "url": "https://api.sofascore.app/api/v1/player/1089388/heatmap/overall",
    "file": "assets/heatmaps/1089388.png"
  },
  {
    "player": "Jayden Bogle",
    "id": 929132,
    "url": "https://api.sofascore.app/api/v1/player/929132/heatmap/overall",
    "file": "assets/heatmaps/929132.png"
  },
  {
    "player": "Adama Boiro",
    "id": 1398511,
    "url": "https://api.sofascore.app/api/v1/player/1398511/heatmap/overall",
    "file": "assets/heatmaps/1398511.png"
  },
  {
    "player": "Hugo Bolin",
    "id": 1142210,
    "url": "https://api.sofascore.app/api/v1/player/1142210/heatmap/overall",
    "file": "assets/heatmaps/1142210.png"
  },
  {
    "player": "Daniel Boloca",
    "id": 882592,
    "url": "https://api.sofascore.app/api/v1/player/882592/heatmap/overall",
    "file": "assets/heatmaps/882592.png"
  },
  {
    "player": "Moïse Bombito",
    "id": 1469180,
    "url": "https://api.sofascore.app/api/v1/player/1469180/heatmap/overall",
    "file": "assets/heatmaps/1469180.png"
  },
  {
    "player": "Federico Bonazzoli",
    "id": 284363,
    "url": "https://api.sofascore.app/api/v1/player/284363/heatmap/overall",
    "file": "assets/heatmaps/284363.png"
  },
  {
    "player": "Warren Bondo",
    "id": 1000366,
    "url": "https://api.sofascore.app/api/v1/player/1000366/heatmap/overall",
    "file": "assets/heatmaps/1000366.png"
  },
  {
    "player": "Victor Boniface",
    "id": 978521,
    "url": "https://api.sofascore.app/api/v1/player/978521/heatmap/overall",
    "file": "assets/heatmaps/978521.png"
  },
  {
    "player": "Ange-Yoan Bonny",
    "id": 1086223,
    "url": "https://api.sofascore.app/api/v1/player/1086223/heatmap/overall",
    "file": "assets/heatmaps/1086223.png"
  },
  {
    "player": "Thiago Borbas",
    "id": 1018547,
    "url": "https://api.sofascore.app/api/v1/player/1018547/heatmap/overall",
    "file": "assets/heatmaps/1018547.png"
  },
  {
    "player": "Sebastiaan Bornauw",
    "id": 826167,
    "url": "https://api.sofascore.app/api/v1/player/826167/heatmap/overall",
    "file": "assets/heatmaps/826167.png"
  },
  {
    "player": "Gennaro Borrelli",
    "id": 979479,
    "url": "https://api.sofascore.app/api/v1/player/979479/heatmap/overall",
    "file": "assets/heatmaps/979479.png"
  },
  {
    "player": "Olivier Boscagli",
    "id": 788784,
    "url": "https://api.sofascore.app/api/v1/player/788784/heatmap/overall",
    "file": "assets/heatmaps/788784.png"
  },
  {
    "player": "Sebastián Boselli",
    "id": 1392092,
    "url": "https://api.sofascore.app/api/v1/player/1392092/heatmap/overall",
    "file": "assets/heatmaps/1392092.png"
  },
  {
    "player": "Sven Botman",
    "id": 910046,
    "url": "https://api.sofascore.app/api/v1/player/910046/heatmap/overall",
    "file": "assets/heatmaps/910046.png"
  },
  {
    "player": "Ayyoub Bouaddi",
    "id": 1564180,
    "url": "https://api.sofascore.app/api/v1/player/1564180/heatmap/overall",
    "file": "assets/heatmaps/1564180.png"
  },
  {
    "player": "Badredine Bouanani",
    "id": 1153265,
    "url": "https://api.sofascore.app/api/v1/player/1153265/heatmap/overall",
    "file": "assets/heatmaps/1153265.png"
  },
  {
    "player": "Kaïl Boudache",
    "id": 1518669,
    "url": "https://api.sofascore.app/api/v1/player/1518669/heatmap/overall",
    "file": "assets/heatmaps/1518669.png"
  },
  {
    "player": "Hicham Boudaoui",
    "id": 985923,
    "url": "https://api.sofascore.app/api/v1/player/985923/heatmap/overall",
    "file": "assets/heatmaps/985923.png"
  },
  {
    "player": "Sofiane Boufal",
    "id": 257205,
    "url": "https://api.sofascore.app/api/v1/player/257205/heatmap/overall",
    "file": "assets/heatmaps/257205.png"
  },
  {
    "player": "Jarrod Bowen",
    "id": 552884,
    "url": "https://api.sofascore.app/api/v1/player/552884/heatmap/overall",
    "file": "assets/heatmaps/552884.png"
  },
  {
    "player": "Kieron Bowie",
    "id": 983601,
    "url": "https://api.sofascore.app/api/v1/player/983601/heatmap/overall",
    "file": "assets/heatmaps/983601.png"
  },
  {
    "player": "Lucas Boyé",
    "id": 814385,
    "url": "https://api.sofascore.app/api/v1/player/814385/heatmap/overall",
    "file": "assets/heatmaps/814385.png"
  },
  {
    "player": "Rosen Bozhinov",
    "id": 1152943,
    "url": "https://api.sofascore.app/api/v1/player/1152943/heatmap/overall",
    "file": "assets/heatmaps/1152943.png"
  },
  {
    "player": "Domagoj Bradarić",
    "id": 897594,
    "url": "https://api.sofascore.app/api/v1/player/897594/heatmap/overall",
    "file": "assets/heatmaps/897594.png"
  },
  {
    "player": "Conor Bradley",
    "id": 1008402,
    "url": "https://api.sofascore.app/api/v1/player/1008402/heatmap/overall",
    "file": "assets/heatmaps/1008402.png"
  },
  {
    "player": "Julian Brandt",
    "id": 226978,
    "url": "https://api.sofascore.app/api/v1/player/226978/heatmap/overall",
    "file": "assets/heatmaps/226978.png"
  },
  {
    "player": "Jarrad Branthwaite",
    "id": 979563,
    "url": "https://api.sofascore.app/api/v1/player/979563/heatmap/overall",
    "file": "assets/heatmaps/979563.png"
  },
  {
    "player": "Lilian Brassier",
    "id": 988907,
    "url": "https://api.sofascore.app/api/v1/player/988907/heatmap/overall",
    "file": "assets/heatmaps/988907.png"
  },
  {
    "player": "Gleison Bremer",
    "id": 885197,
    "url": "https://api.sofascore.app/api/v1/player/885197/heatmap/overall",
    "file": "assets/heatmaps/885197.png"
  },
  {
    "player": "Abel Bretones",
    "id": 1010165,
    "url": "https://api.sofascore.app/api/v1/player/1010165/heatmap/overall",
    "file": "assets/heatmaps/1010165.png"
  },
  {
    "player": "Sascha Britschgi",
    "id": 1963449,
    "url": "https://api.sofascore.app/api/v1/player/1963449/heatmap/overall",
    "file": "assets/heatmaps/1963449.png"
  },
  {
    "player": "Brian Brobbey",
    "id": 910048,
    "url": "https://api.sofascore.app/api/v1/player/910048/heatmap/overall",
    "file": "assets/heatmaps/910048.png"
  },
  {
    "player": "Marius Broholm",
    "id": 1130111,
    "url": "https://api.sofascore.app/api/v1/player/1130111/heatmap/overall",
    "file": "assets/heatmaps/1130111.png"
  },
  {
    "player": "Armando Broja",
    "id": 996985,
    "url": "https://api.sofascore.app/api/v1/player/996985/heatmap/overall",
    "file": "assets/heatmaps/996985.png"
  },
  {
    "player": "David Brooks",
    "id": 855731,
    "url": "https://api.sofascore.app/api/v1/player/855731/heatmap/overall",
    "file": "assets/heatmaps/855731.png"
  },
  {
    "player": "Nathaniel Brown",
    "id": 1159759,
    "url": "https://api.sofascore.app/api/v1/player/1159759/heatmap/overall",
    "file": "assets/heatmaps/1159759.png"
  },
  {
    "player": "Paris Brunner",
    "id": 1403216,
    "url": "https://api.sofascore.app/api/v1/player/1403216/heatmap/overall",
    "file": "assets/heatmaps/1403216.png"
  },
  {
    "player": "Jacob Bruun Larsen",
    "id": 809276,
    "url": "https://api.sofascore.app/api/v1/player/809276/heatmap/overall",
    "file": "assets/heatmaps/809276.png"
  },
  {
    "player": "Tajon Buchanan",
    "id": 973290,
    "url": "https://api.sofascore.app/api/v1/player/973290/heatmap/overall",
    "file": "assets/heatmaps/973290.png"
  },
  {
    "player": "Ante Budimir",
    "id": 37318,
    "url": "https://api.sofascore.app/api/v1/player/37318/heatmap/overall",
    "file": "assets/heatmaps/37318.png"
  },
  {
    "player": "Hugo Bueno",
    "id": 1013928,
    "url": "https://api.sofascore.app/api/v1/player/1013928/heatmap/overall",
    "file": "assets/heatmaps/1013928.png"
  },
  {
    "player": "Manu Bueno",
    "id": 1142094,
    "url": "https://api.sofascore.app/api/v1/player/1142094/heatmap/overall",
    "file": "assets/heatmaps/1142094.png"
  },
  {
    "player": "Santiago Bueno",
    "id": 846308,
    "url": "https://api.sofascore.app/api/v1/player/846308/heatmap/overall",
    "file": "assets/heatmaps/846308.png"
  },
  {
    "player": "Adam Buksa",
    "id": 1138856,
    "url": "https://api.sofascore.app/api/v1/player/1138856/heatmap/overall",
    "file": "assets/heatmaps/1138856.png"
  },
  {
    "player": "Andrija Bulatović",
    "id": 1423504,
    "url": "https://api.sofascore.app/api/v1/player/1423504/heatmap/overall",
    "file": "assets/heatmaps/1423504.png"
  },
  {
    "player": "Marius Bülter",
    "id": 378340,
    "url": "https://api.sofascore.app/api/v1/player/378340/heatmap/overall",
    "file": "assets/heatmaps/378340.png"
  },
  {
    "player": "Alessandro Buongiorno",
    "id": 870263,
    "url": "https://api.sofascore.app/api/v1/player/870263/heatmap/overall",
    "file": "assets/heatmaps/870263.png"
  },
  {
    "player": "Livan Burcu",
    "id": 1513469,
    "url": "https://api.sofascore.app/api/v1/player/1513469/heatmap/overall",
    "file": "assets/heatmaps/1513469.png"
  },
  {
    "player": "Jan Bürger",
    "id": 1568511,
    "url": "https://api.sofascore.app/api/v1/player/1568511/heatmap/overall",
    "file": "assets/heatmaps/1568511.png"
  },
  {
    "player": "Wouter Burger",
    "id": 916946,
    "url": "https://api.sofascore.app/api/v1/player/916946/heatmap/overall",
    "file": "assets/heatmaps/916946.png"
  },
  {
    "player": "Jonathan Burkardt",
    "id": 939830,
    "url": "https://api.sofascore.app/api/v1/player/939830/heatmap/overall",
    "file": "assets/heatmaps/939830.png"
  },
  {
    "player": "Oliver Burke",
    "id": 608362,
    "url": "https://api.sofascore.app/api/v1/player/608362/heatmap/overall",
    "file": "assets/heatmaps/608362.png"
  },
  {
    "player": "Dan Burn",
    "id": 99090,
    "url": "https://api.sofascore.app/api/v1/player/99090/heatmap/overall",
    "file": "assets/heatmaps/99090.png"
  },
  {
    "player": "Marnon Busch",
    "id": 168861,
    "url": "https://api.sofascore.app/api/v1/player/168861/heatmap/overall",
    "file": "assets/heatmaps/168861.png"
  },
  {
    "player": "Jean Butez",
    "id": 599114,
    "url": "https://api.sofascore.app/api/v1/player/599114/heatmap/overall",
    "file": "assets/heatmaps/599114.png"
  },
  {
    "player": "Jun'ai Byfield",
    "id": 1913038,
    "url": "https://api.sofascore.app/api/v1/player/1913038/heatmap/overall",
    "file": "assets/heatmaps/1913038.png"
  },
  {
    "player": "Sam Byram",
    "id": 254713,
    "url": "https://api.sofascore.app/api/v1/player/254713/heatmap/overall",
    "file": "assets/heatmaps/254713.png"
  },
  {
    "player": "William Bøving",
    "id": 1021075,
    "url": "https://api.sofascore.app/api/v1/player/1021075/heatmap/overall",
    "file": "assets/heatmaps/1021075.png"
  },
  {
    "player": "Rémy Cabella",
    "id": 72998,
    "url": "https://api.sofascore.app/api/v1/player/72998/heatmap/overall",
    "file": "assets/heatmaps/72998.png"
  },
  {
    "player": "Pape Cabral",
    "id": 1606641,
    "url": "https://api.sofascore.app/api/v1/player/1606641/heatmap/overall",
    "file": "assets/heatmaps/1606641.png"
  },
  {
    "player": "Leandro Cabrera",
    "id": 81992,
    "url": "https://api.sofascore.app/api/v1/player/81992/heatmap/overall",
    "file": "assets/heatmaps/81992.png"
  },
  {
    "player": "Anthony Caci",
    "id": 846471,
    "url": "https://api.sofascore.app/api/v1/player/846471/heatmap/overall",
    "file": "assets/heatmaps/846471.png"
  },
  {
    "player": "Noah Cadiou",
    "id": 993952,
    "url": "https://api.sofascore.app/api/v1/player/993952/heatmap/overall",
    "file": "assets/heatmaps/993952.png"
  },
  {
    "player": "Moisés Caicedo",
    "id": 987650,
    "url": "https://api.sofascore.app/api/v1/player/987650/heatmap/overall",
    "file": "assets/heatmaps/987650.png"
  },
  {
    "player": "Tom Cairney",
    "id": 82566,
    "url": "https://api.sofascore.app/api/v1/player/82566/heatmap/overall",
    "file": "assets/heatmaps/82566.png"
  },
  {
    "player": "Arturo Calabresi",
    "id": 284367,
    "url": "https://api.sofascore.app/api/v1/player/284367/heatmap/overall",
    "file": "assets/heatmaps/284367.png"
  },
  {
    "player": "Riccardo Calafiori",
    "id": 957602,
    "url": "https://api.sofascore.app/api/v1/player/957602/heatmap/overall",
    "file": "assets/heatmaps/957602.png"
  },
  {
    "player": "Calebe",
    "id": 1046796,
    "url": "https://api.sofascore.app/api/v1/player/1046796/heatmap/overall",
    "file": "assets/heatmaps/1046796.png"
  },
  {
    "player": "Fernando Calero",
    "id": 857205,
    "url": "https://api.sofascore.app/api/v1/player/857205/heatmap/overall",
    "file": "assets/heatmaps/857205.png"
  },
  {
    "player": "Duje Ćaleta-Car",
    "id": 257091,
    "url": "https://api.sofascore.app/api/v1/player/257091/heatmap/overall",
    "file": "assets/heatmaps/257091.png"
  },
  {
    "player": "Hakan Çalhanoğlu",
    "id": 135700,
    "url": "https://api.sofascore.app/api/v1/player/135700/heatmap/overall",
    "file": "assets/heatmaps/135700.png"
  },
  {
    "player": "Dominic Calvert-Lewin",
    "id": 372344,
    "url": "https://api.sofascore.app/api/v1/player/372344/heatmap/overall",
    "file": "assets/heatmaps/372344.png"
  },
  {
    "player": "Dani Calvo",
    "id": 560756,
    "url": "https://api.sofascore.app/api/v1/player/560756/heatmap/overall",
    "file": "assets/heatmaps/560756.png"
  },
  {
    "player": "Amady Camara",
    "id": 1516047,
    "url": "https://api.sofascore.app/api/v1/player/1516047/heatmap/overall",
    "file": "assets/heatmaps/1516047.png"
  },
  {
    "player": "Lamine Camara",
    "id": 1389846,
    "url": "https://api.sofascore.app/api/v1/player/1389846/heatmap/overall",
    "file": "assets/heatmaps/1389846.png"
  },
  {
    "player": "Mahdi Camara",
    "id": 916041,
    "url": "https://api.sofascore.app/api/v1/player/916041/heatmap/overall",
    "file": "assets/heatmaps/916041.png"
  },
  {
    "player": "Ousmane Camara",
    "id": 1049538,
    "url": "https://api.sofascore.app/api/v1/player/1049538/heatmap/overall",
    "file": "assets/heatmaps/1049538.png"
  },
  {
    "player": "Francesco Camarda",
    "id": 1520771,
    "url": "https://api.sofascore.app/api/v1/player/1520771/heatmap/overall",
    "file": "assets/heatmaps/1520771.png"
  },
  {
    "player": "Eduardo Camavinga",
    "id": 973887,
    "url": "https://api.sofascore.app/api/v1/player/973887/heatmap/overall",
    "file": "assets/heatmaps/973887.png"
  },
  {
    "player": "Nicolò Cambiaghi",
    "id": 971005,
    "url": "https://api.sofascore.app/api/v1/player/971005/heatmap/overall",
    "file": "assets/heatmaps/971005.png"
  },
  {
    "player": "Andrea Cambiaso",
    "id": 917048,
    "url": "https://api.sofascore.app/api/v1/player/917048/heatmap/overall",
    "file": "assets/heatmaps/917048.png"
  },
  {
    "player": "Sergio Camello",
    "id": 910024,
    "url": "https://api.sofascore.app/api/v1/player/910024/heatmap/overall",
    "file": "assets/heatmaps/910024.png"
  },
  {
    "player": "Emre Can",
    "id": 138156,
    "url": "https://api.sofascore.app/api/v1/player/138156/heatmap/overall",
    "file": "assets/heatmaps/138156.png"
  },
  {
    "player": "Matteo Cancellieri",
    "id": 1017649,
    "url": "https://api.sofascore.app/api/v1/player/1017649/heatmap/overall",
    "file": "assets/heatmaps/1017649.png"
  },
  {
    "player": "João Cancelo",
    "id": 138892,
    "url": "https://api.sofascore.app/api/v1/player/138892/heatmap/overall",
    "file": "assets/heatmaps/138892.png"
  },
  {
    "player": "Fali Candé",
    "id": 892430,
    "url": "https://api.sofascore.app/api/v1/player/892430/heatmap/overall",
    "file": "assets/heatmaps/892430.png"
  },
  {
    "player": "Simone Canestrelli",
    "id": 911355,
    "url": "https://api.sofascore.app/api/v1/player/911355/heatmap/overall",
    "file": "assets/heatmaps/911355.png"
  },
  {
    "player": "Jaydee Canvot",
    "id": 1471671,
    "url": "https://api.sofascore.app/api/v1/player/1471671/heatmap/overall",
    "file": "assets/heatmaps/1471671.png"
  },
  {
    "player": "Nicolás Capaldo",
    "id": 973564,
    "url": "https://api.sofascore.app/api/v1/player/973564/heatmap/overall",
    "file": "assets/heatmaps/973564.png"
  },
  {
    "player": "Pierrick Capelle",
    "id": 209768,
    "url": "https://api.sofascore.app/api/v1/player/209768/heatmap/overall",
    "file": "assets/heatmaps/209768.png"
  },
  {
    "player": "Elia Caprile",
    "id": 947954,
    "url": "https://api.sofascore.app/api/v1/player/947954/heatmap/overall",
    "file": "assets/heatmaps/947954.png"
  },
  {
    "player": "Maxence Caqueret",
    "id": 859027,
    "url": "https://api.sofascore.app/api/v1/player/859027/heatmap/overall",
    "file": "assets/heatmaps/859027.png"
  },
  {
    "player": "Antonio Caracciolo",
    "id": 116666,
    "url": "https://api.sofascore.app/api/v1/player/116666/heatmap/overall",
    "file": "assets/heatmaps/116666.png"
  },
  {
    "player": "Franco Carboni",
    "id": 1086199,
    "url": "https://api.sofascore.app/api/v1/player/1086199/heatmap/overall",
    "file": "assets/heatmaps/1086199.png"
  },
  {
    "player": "Sergi Cardona",
    "id": 986245,
    "url": "https://api.sofascore.app/api/v1/player/986245/heatmap/overall",
    "file": "assets/heatmaps/986245.png"
  },
  {
    "player": "Fábio Cardoso",
    "id": 1534422,
    "url": "https://api.sofascore.app/api/v1/player/1534422/heatmap/overall",
    "file": "assets/heatmaps/1534422.png"
  },
  {
    "player": "Johnny Cardoso",
    "id": 990169,
    "url": "https://api.sofascore.app/api/v1/player/990169/heatmap/overall",
    "file": "assets/heatmaps/990169.png"
  },
  {
    "player": "Patrik Carlgren",
    "id": 156236,
    "url": "https://api.sofascore.app/api/v1/player/156236/heatmap/overall",
    "file": "assets/heatmaps/156236.png"
  },
  {
    "player": "Diego Carlos",
    "id": 604232,
    "url": "https://api.sofascore.app/api/v1/player/604232/heatmap/overall",
    "file": "assets/heatmaps/604232.png"
  },
  {
    "player": "Kevin Carlos",
    "id": 1035619,
    "url": "https://api.sofascore.app/api/v1/player/1035619/heatmap/overall",
    "file": "assets/heatmaps/1035619.png"
  },
  {
    "player": "David Carmo",
    "id": 892235,
    "url": "https://api.sofascore.app/api/v1/player/892235/heatmap/overall",
    "file": "assets/heatmaps/892235.png"
  },
  {
    "player": "Carmona",
    "id": 1015240,
    "url": "https://api.sofascore.app/api/v1/player/1015240/heatmap/overall",
    "file": "assets/heatmaps/1015240.png"
  },
  {
    "player": "Marco Carnesecchi",
    "id": 865646,
    "url": "https://api.sofascore.app/api/v1/player/865646/heatmap/overall",
    "file": "assets/heatmaps/865646.png"
  },
  {
    "player": "Sergio Carreira",
    "id": 1002764,
    "url": "https://api.sofascore.app/api/v1/player/1002764/heatmap/overall",
    "file": "assets/heatmaps/1002764.png"
  },
  {
    "player": "Gorka Carrera",
    "id": 1985103,
    "url": "https://api.sofascore.app/api/v1/player/1985103/heatmap/overall",
    "file": "assets/heatmaps/1985103.png"
  },
  {
    "player": "Álvaro Carreras",
    "id": 1085081,
    "url": "https://api.sofascore.app/api/v1/player/1085081/heatmap/overall",
    "file": "assets/heatmaps/1085081.png"
  },
  {
    "player": "Dani Carvajal",
    "id": 138572,
    "url": "https://api.sofascore.app/api/v1/player/138572/heatmap/overall",
    "file": "assets/heatmaps/138572.png"
  },
  {
    "player": "Fabio Carvalho",
    "id": 991604,
    "url": "https://api.sofascore.app/api/v1/player/991604/heatmap/overall",
    "file": "assets/heatmaps/991604.png"
  },
  {
    "player": "Cesare Casadei",
    "id": 1016788,
    "url": "https://api.sofascore.app/api/v1/player/1016788/heatmap/overall",
    "file": "assets/heatmaps/1016788.png"
  },
  {
    "player": "Marc Casado",
    "id": 1000483,
    "url": "https://api.sofascore.app/api/v1/player/1000483/heatmap/overall",
    "file": "assets/heatmaps/1000483.png"
  },
  {
    "player": "Nicolò Casale",
    "id": 862697,
    "url": "https://api.sofascore.app/api/v1/player/862697/heatmap/overall",
    "file": "assets/heatmaps/862697.png"
  },
  {
    "player": "Casemiro",
    "id": 122951,
    "url": "https://api.sofascore.app/api/v1/player/122951/heatmap/overall",
    "file": "assets/heatmaps/122951.png"
  },
  {
    "player": "Matty Cash",
    "id": 833956,
    "url": "https://api.sofascore.app/api/v1/player/833956/heatmap/overall",
    "file": "assets/heatmaps/833956.png"
  },
  {
    "player": "Josué Casimir",
    "id": 1035986,
    "url": "https://api.sofascore.app/api/v1/player/1035986/heatmap/overall",
    "file": "assets/heatmaps/1035986.png"
  },
  {
    "player": "Cristian Cásseres Jr.",
    "id": 878938,
    "url": "https://api.sofascore.app/api/v1/player/878938/heatmap/overall",
    "file": "assets/heatmaps/878938.png"
  },
  {
    "player": "Timothy Castagne",
    "id": 329417,
    "url": "https://api.sofascore.app/api/v1/player/329417/heatmap/overall",
    "file": "assets/heatmaps/329417.png"
  },
  {
    "player": "Valentín Castellanos",
    "id": 877013,
    "url": "https://api.sofascore.app/api/v1/player/877013/heatmap/overall",
    "file": "assets/heatmaps/877013.png"
  },
  {
    "player": "Castrin",
    "id": 1428699,
    "url": "https://api.sofascore.app/api/v1/player/1428699/heatmap/overall",
    "file": "assets/heatmaps/1428699.png"
  },
  {
    "player": "Santiago Castro",
    "id": 1116577,
    "url": "https://api.sofascore.app/api/v1/player/1116577/heatmap/overall",
    "file": "assets/heatmaps/1116577.png"
  },
  {
    "player": "Alessio Castro-Montes",
    "id": 839898,
    "url": "https://api.sofascore.app/api/v1/player/839898/heatmap/overall",
    "file": "assets/heatmaps/839898.png"
  },
  {
    "player": "Danilo Cataldi",
    "id": 317301,
    "url": "https://api.sofascore.app/api/v1/player/317301/heatmap/overall",
    "file": "assets/heatmaps/317301.png"
  },
  {
    "player": "Catena",
    "id": 900792,
    "url": "https://api.sofascore.app/api/v1/player/900792/heatmap/overall",
    "file": "assets/heatmaps/900792.png"
  },
  {
    "player": "Santi Cazorla",
    "id": 17651,
    "url": "https://api.sofascore.app/api/v1/player/17651/heatmap/overall",
    "file": "assets/heatmaps/17651.png"
  },
  {
    "player": "Dani Ceballos",
    "id": 547838,
    "url": "https://api.sofascore.app/api/v1/player/547838/heatmap/overall",
    "file": "assets/heatmaps/547838.png"
  },
  {
    "player": "Federico Ceccherini",
    "id": 139410,
    "url": "https://api.sofascore.app/api/v1/player/139410/heatmap/overall",
    "file": "assets/heatmaps/139410.png"
  },
  {
    "player": "Abdoulie Ceesay",
    "id": 1888501,
    "url": "https://api.sofascore.app/api/v1/player/1888501/heatmap/overall",
    "file": "assets/heatmaps/1888501.png"
  },
  {
    "player": "Nidal Celik",
    "id": 1399503,
    "url": "https://api.sofascore.app/api/v1/player/1399503/heatmap/overall",
    "file": "assets/heatmaps/1399503.png"
  },
  {
    "player": "Zeki Çelik",
    "id": 893008,
    "url": "https://api.sofascore.app/api/v1/player/893008/heatmap/overall",
    "file": "assets/heatmaps/893008.png"
  },
  {
    "player": "Fabien Centonze",
    "id": 802034,
    "url": "https://api.sofascore.app/api/v1/player/802034/heatmap/overall",
    "file": "assets/heatmaps/802034.png"
  },
  {
    "player": "Lucas Cepeda",
    "id": 1126447,
    "url": "https://api.sofascore.app/api/v1/player/1126447/heatmap/overall",
    "file": "assets/heatmaps/1126447.png"
  },
  {
    "player": "Jorge Cestero",
    "id": 1590121,
    "url": "https://api.sofascore.app/api/v1/player/1590121/heatmap/overall",
    "file": "assets/heatmaps/1590121.png"
  },
  {
    "player": "El Chadaille Bitshiabu",
    "id": 1048009,
    "url": "https://api.sofascore.app/api/v1/player/1048009/heatmap/overall",
    "file": "assets/heatmaps/1048009.png"
  },
  {
    "player": "Fares Chaïbi",
    "id": 1192318,
    "url": "https://api.sofascore.app/api/v1/player/1192318/heatmap/overall",
    "file": "assets/heatmaps/1192318.png"
  },
  {
    "player": "Ilyas Chaira",
    "id": 1008037,
    "url": "https://api.sofascore.app/api/v1/player/1008037/heatmap/overall",
    "file": "assets/heatmaps/1008037.png"
  },
  {
    "player": "Trevoh Chalobah",
    "id": 826134,
    "url": "https://api.sofascore.app/api/v1/player/826134/heatmap/overall",
    "file": "assets/heatmaps/826134.png"
  },
  {
    "player": "Fallou Cham",
    "id": 1945133,
    "url": "https://api.sofascore.app/api/v1/player/1945133/heatmap/overall",
    "file": "assets/heatmaps/1945133.png"
  },
  {
    "player": "Brendan Chardonnet",
    "id": 328035,
    "url": "https://api.sofascore.app/api/v1/player/328035/heatmap/overall",
    "file": "assets/heatmaps/328035.png"
  },
  {
    "player": "Pep Chavarría",
    "id": 1010421,
    "url": "https://api.sofascore.app/api/v1/player/1010421/heatmap/overall",
    "file": "assets/heatmaps/1010421.png"
  },
  {
    "player": "Arthur Chaves",
    "id": 1122806,
    "url": "https://api.sofascore.app/api/v1/player/1122806/heatmap/overall",
    "file": "assets/heatmaps/1122806.png"
  },
  {
    "player": "Felipe Chávez",
    "id": 1482457,
    "url": "https://api.sofascore.app/api/v1/player/1482457/heatmap/overall",
    "file": "assets/heatmaps/1482457.png"
  },
  {
    "player": "Walid Cheddira",
    "id": 917485,
    "url": "https://api.sofascore.app/api/v1/player/917485/heatmap/overall",
    "file": "assets/heatmaps/917485.png"
  },
  {
    "player": "Chema",
    "id": 1464641,
    "url": "https://api.sofascore.app/api/v1/player/1464641/heatmap/overall",
    "file": "assets/heatmaps/1464641.png"
  },
  {
    "player": "Rayan Cherki",
    "id": 979128,
    "url": "https://api.sofascore.app/api/v1/player/979128/heatmap/overall",
    "file": "assets/heatmaps/979128.png"
  },
  {
    "player": "Lucas Chevalier",
    "id": 996953,
    "url": "https://api.sofascore.app/api/v1/player/996953/heatmap/overall",
    "file": "assets/heatmaps/996953.png"
  },
  {
    "player": "Fabio Chiarodia",
    "id": 1130067,
    "url": "https://api.sofascore.app/api/v1/player/1130067/heatmap/overall",
    "file": "assets/heatmaps/1130067.png"
  },
  {
    "player": "Federico Chiesa",
    "id": 845386,
    "url": "https://api.sofascore.app/api/v1/player/845386/heatmap/overall",
    "file": "assets/heatmaps/845386.png"
  },
  {
    "player": "Ben Chilwell",
    "id": 802695,
    "url": "https://api.sofascore.app/api/v1/player/802695/heatmap/overall",
    "file": "assets/heatmaps/802695.png"
  },
  {
    "player": "Joris Chotard",
    "id": 976396,
    "url": "https://api.sofascore.app/api/v1/player/976396/heatmap/overall",
    "file": "assets/heatmaps/976396.png"
  },
  {
    "player": "Andreas Christensen",
    "id": 186795,
    "url": "https://api.sofascore.app/api/v1/player/186795/heatmap/overall",
    "file": "assets/heatmaps/186795.png"
  },
  {
    "player": "Ryan Christie",
    "id": 322391,
    "url": "https://api.sofascore.app/api/v1/player/322391/heatmap/overall",
    "file": "assets/heatmaps/322391.png"
  },
  {
    "player": "Carney Chukwuemeka",
    "id": 994556,
    "url": "https://api.sofascore.app/api/v1/player/994556/heatmap/overall",
    "file": "assets/heatmaps/994556.png"
  },
  {
    "player": "Samuel Chukwueze",
    "id": 822470,
    "url": "https://api.sofascore.app/api/v1/player/822470/heatmap/overall",
    "file": "assets/heatmaps/822470.png"
  },
  {
    "player": "Víctor Chust",
    "id": 855831,
    "url": "https://api.sofascore.app/api/v1/player/855831/heatmap/overall",
    "file": "assets/heatmaps/855831.png"
  },
  {
    "player": "Alessandro Circati",
    "id": 1155423,
    "url": "https://api.sofascore.app/api/v1/player/1155423/heatmap/overall",
    "file": "assets/heatmaps/1155423.png"
  },
  {
    "player": "Dennis Cirkin",
    "id": 1014987,
    "url": "https://api.sofascore.app/api/v1/player/1014987/heatmap/overall",
    "file": "assets/heatmaps/1014987.png"
  },
  {
    "player": "Pathé Ciss",
    "id": 913679,
    "url": "https://api.sofascore.app/api/v1/player/913679/heatmap/overall",
    "file": "assets/heatmaps/913679.png"
  },
  {
    "player": "Djaoui Cissé",
    "id": 1445628,
    "url": "https://api.sofascore.app/api/v1/player/1445628/heatmap/overall",
    "file": "assets/heatmaps/1445628.png"
  },
  {
    "player": "Alexis Claude-Maurice",
    "id": 822877,
    "url": "https://api.sofascore.app/api/v1/player/822877/heatmap/overall",
    "file": "assets/heatmaps/822877.png"
  },
  {
    "player": "Jonathan Clauss",
    "id": 821728,
    "url": "https://api.sofascore.app/api/v1/player/821728/heatmap/overall",
    "file": "assets/heatmaps/821728.png"
  },
  {
    "player": "Nathaniel Clyne",
    "id": 43215,
    "url": "https://api.sofascore.app/api/v1/player/43215/heatmap/overall",
    "file": "assets/heatmaps/43215.png"
  },
  {
    "player": "Saúl Coco",
    "id": 1089453,
    "url": "https://api.sofascore.app/api/v1/player/1089453/heatmap/overall",
    "file": "assets/heatmaps/1089453.png"
  },
  {
    "player": "Séamus Coleman",
    "id": 76632,
    "url": "https://api.sofascore.app/api/v1/player/76632/heatmap/overall",
    "file": "assets/heatmaps/76632.png"
  },
  {
    "player": "Maxime Colin",
    "id": 128285,
    "url": "https://api.sofascore.app/api/v1/player/128285/heatmap/overall",
    "file": "assets/heatmaps/128285.png"
  },
  {
    "player": "Nathan Collins",
    "id": 958916,
    "url": "https://api.sofascore.app/api/v1/player/958916/heatmap/overall",
    "file": "assets/heatmaps/958916.png"
  },
  {
    "player": "Nnamdi Collins",
    "id": 1048569,
    "url": "https://api.sofascore.app/api/v1/player/1048569/heatmap/overall",
    "file": "assets/heatmaps/1048569.png"
  },
  {
    "player": "Michele Collocolo",
    "id": 839925,
    "url": "https://api.sofascore.app/api/v1/player/839925/heatmap/overall",
    "file": "assets/heatmaps/839925.png"
  },
  {
    "player": "Santiago Colombatto",
    "id": 822379,
    "url": "https://api.sofascore.app/api/v1/player/822379/heatmap/overall",
    "file": "assets/heatmaps/822379.png"
  },
  {
    "player": "Lorenzo Colombo",
    "id": 930191,
    "url": "https://api.sofascore.app/api/v1/player/930191/heatmap/overall",
    "file": "assets/heatmaps/930191.png"
  },
  {
    "player": "Eray Cömert",
    "id": 814023,
    "url": "https://api.sofascore.app/api/v1/player/814023/heatmap/overall",
    "file": "assets/heatmaps/814023.png"
  },
  {
    "player": "Santi Comesaña",
    "id": 843678,
    "url": "https://api.sofascore.app/api/v1/player/843678/heatmap/overall",
    "file": "assets/heatmaps/843678.png"
  },
  {
    "player": "Pietro Comuzzo",
    "id": 1210848,
    "url": "https://api.sofascore.app/api/v1/player/1210848/heatmap/overall",
    "file": "assets/heatmaps/1210848.png"
  },
  {
    "player": "Francisco Conceição",
    "id": 979222,
    "url": "https://api.sofascore.app/api/v1/player/979222/heatmap/overall",
    "file": "assets/heatmaps/979222.png"
  },
  {
    "player": "Christian Conteh",
    "id": 933833,
    "url": "https://api.sofascore.app/api/v1/player/933833/heatmap/overall",
    "file": "assets/heatmaps/933833.png"
  },
  {
    "player": "Sirlord Conteh",
    "id": 800400,
    "url": "https://api.sofascore.app/api/v1/player/800400/heatmap/overall",
    "file": "assets/heatmaps/800400.png"
  },
  {
    "player": "Lewis Cook",
    "id": 548188,
    "url": "https://api.sofascore.app/api/v1/player/548188/heatmap/overall",
    "file": "assets/heatmaps/548188.png"
  },
  {
    "player": "Copete",
    "id": 913695,
    "url": "https://api.sofascore.app/api/v1/player/913695/heatmap/overall",
    "file": "assets/heatmaps/913695.png"
  },
  {
    "player": "Francesco Coppola",
    "id": 1494096,
    "url": "https://api.sofascore.app/api/v1/player/1494096/heatmap/overall",
    "file": "assets/heatmaps/1494096.png"
  },
  {
    "player": "Francis Coquelin",
    "id": 40672,
    "url": "https://api.sofascore.app/api/v1/player/40672/heatmap/overall",
    "file": "assets/heatmaps/40672.png"
  },
  {
    "player": "Maxwel Cornet",
    "id": 280439,
    "url": "https://api.sofascore.app/api/v1/player/280439/heatmap/overall",
    "file": "assets/heatmaps/280439.png"
  },
  {
    "player": "Iván Corralejo",
    "id": 1542759,
    "url": "https://api.sofascore.app/api/v1/player/1542759/heatmap/overall",
    "file": "assets/heatmaps/1542759.png"
  },
  {
    "player": "Félix Correia",
    "id": 934498,
    "url": "https://api.sofascore.app/api/v1/player/934498/heatmap/overall",
    "file": "assets/heatmaps/934498.png"
  },
  {
    "player": "Thierry Correia",
    "id": 851282,
    "url": "https://api.sofascore.app/api/v1/player/851282/heatmap/overall",
    "file": "assets/heatmaps/851282.png"
  },
  {
    "player": "Paco Cortés",
    "id": 1869106,
    "url": "https://api.sofascore.app/api/v1/player/1869106/heatmap/overall",
    "file": "assets/heatmaps/1869106.png"
  },
  {
    "player": "Edoardo Corvi",
    "id": 990411,
    "url": "https://api.sofascore.app/api/v1/player/990411/heatmap/overall",
    "file": "assets/heatmaps/990411.png"
  },
  {
    "player": "Danny da Costa",
    "id": 97926,
    "url": "https://api.sofascore.app/api/v1/player/97926/heatmap/overall",
    "file": "assets/heatmaps/97926.png"
  },
  {
    "player": "Samu Costa",
    "id": 988351,
    "url": "https://api.sofascore.app/api/v1/player/988351/heatmap/overall",
    "file": "assets/heatmaps/988351.png"
  },
  {
    "player": "David Costas",
    "id": 345333,
    "url": "https://api.sofascore.app/api/v1/player/345333/heatmap/overall",
    "file": "assets/heatmaps/345333.png"
  },
  {
    "player": "Grégoire Coudert",
    "id": 891508,
    "url": "https://api.sofascore.app/api/v1/player/891508/heatmap/overall",
    "file": "assets/heatmaps/891508.png"
  },
  {
    "player": "Vladimír Coufal",
    "id": 138024,
    "url": "https://api.sofascore.app/api/v1/player/138024/heatmap/overall",
    "file": "assets/heatmaps/138024.png"
  },
  {
    "player": "Djibril Coulibaly",
    "id": 2020789,
    "url": "https://api.sofascore.app/api/v1/player/2020789/heatmap/overall",
    "file": "assets/heatmaps/2020789.png"
  },
  {
    "player": "Lassana Coulibaly",
    "id": 804621,
    "url": "https://api.sofascore.app/api/v1/player/804621/heatmap/overall",
    "file": "assets/heatmaps/804621.png"
  },
  {
    "player": "Lasso Coulibaly",
    "id": 1126588,
    "url": "https://api.sofascore.app/api/v1/player/1126588/heatmap/overall",
    "file": "assets/heatmaps/1126588.png"
  },
  {
    "player": "Mamadou Coulibaly",
    "id": 1410148,
    "url": "https://api.sofascore.app/api/v1/player/1410148/heatmap/overall",
    "file": "assets/heatmaps/1410148.png"
  },
  {
    "player": "Soumaïla Coulibaly",
    "id": 1001858,
    "url": "https://api.sofascore.app/api/v1/player/1001858/heatmap/overall",
    "file": "assets/heatmaps/1001858.png"
  },
  {
    "player": "Woyo Coulibaly",
    "id": 989894,
    "url": "https://api.sofascore.app/api/v1/player/989894/heatmap/overall",
    "file": "assets/heatmaps/989894.png"
  },
  {
    "player": "Marius Courcoul",
    "id": 1506932,
    "url": "https://api.sofascore.app/api/v1/player/1506932/heatmap/overall",
    "file": "assets/heatmaps/1506932.png"
  },
  {
    "player": "Thibaut Courtois",
    "id": 70988,
    "url": "https://api.sofascore.app/api/v1/player/70988/heatmap/overall",
    "file": "assets/heatmaps/70988.png"
  },
  {
    "player": "Yan Couto",
    "id": 1002813,
    "url": "https://api.sofascore.app/api/v1/player/1002813/heatmap/overall",
    "file": "assets/heatmaps/1002813.png"
  },
  {
    "player": "Patrice Čović",
    "id": 1596105,
    "url": "https://api.sofascore.app/api/v1/player/1596105/heatmap/overall",
    "file": "assets/heatmaps/1596105.png"
  },
  {
    "player": "Nicolas Cozza",
    "id": 886286,
    "url": "https://api.sofascore.app/api/v1/player/886286/heatmap/overall",
    "file": "assets/heatmaps/886286.png"
  },
  {
    "player": "Ben Cremaschi",
    "id": 1459459,
    "url": "https://api.sofascore.app/api/v1/player/1459459/heatmap/overall",
    "file": "assets/heatmaps/1459459.png"
  },
  {
    "player": "Charlie Cresswell",
    "id": 1020744,
    "url": "https://api.sofascore.app/api/v1/player/1020744/heatmap/overall",
    "file": "assets/heatmaps/1020744.png"
  },
  {
    "player": "Bryan Cristante",
    "id": 186855,
    "url": "https://api.sofascore.app/api/v1/player/186855/heatmap/overall",
    "file": "assets/heatmaps/186855.png"
  },
  {
    "player": "Juan Cruz Armada",
    "id": 897902,
    "url": "https://api.sofascore.app/api/v1/player/897902/heatmap/overall",
    "file": "assets/heatmaps/897902.png"
  },
  {
    "player": "Juan Cuadrado",
    "id": 47743,
    "url": "https://api.sofascore.app/api/v1/player/47743/heatmap/overall",
    "file": "assets/heatmaps/47743.png"
  },
  {
    "player": "Pau Cubarsí",
    "id": 1402913,
    "url": "https://api.sofascore.app/api/v1/player/1402913/heatmap/overall",
    "file": "assets/heatmaps/1402913.png"
  },
  {
    "player": "Cucho",
    "id": 887055,
    "url": "https://api.sofascore.app/api/v1/player/887055/heatmap/overall",
    "file": "assets/heatmaps/887055.png"
  },
  {
    "player": "Marc Cucurella",
    "id": 794939,
    "url": "https://api.sofascore.app/api/v1/player/794939/heatmap/overall",
    "file": "assets/heatmaps/794939.png"
  },
  {
    "player": "Jorge Cuenca",
    "id": 868715,
    "url": "https://api.sofascore.app/api/v1/player/868715/heatmap/overall",
    "file": "assets/heatmaps/868715.png"
  },
  {
    "player": "Montrell Culbreath",
    "id": 1568522,
    "url": "https://api.sofascore.app/api/v1/player/1568522/heatmap/overall",
    "file": "assets/heatmaps/1568522.png"
  },
  {
    "player": "Josh Cullen",
    "id": 792122,
    "url": "https://api.sofascore.app/api/v1/player/792122/heatmap/overall",
    "file": "assets/heatmaps/792122.png"
  },
  {
    "player": "Pablo Cuñat",
    "id": 1085579,
    "url": "https://api.sofascore.app/api/v1/player/1085579/heatmap/overall",
    "file": "assets/heatmaps/1085579.png"
  },
  {
    "player": "Jair Cunha",
    "id": 1170722,
    "url": "https://api.sofascore.app/api/v1/player/1170722/heatmap/overall",
    "file": "assets/heatmaps/1170722.png"
  },
  {
    "player": "Matheus Cunha",
    "id": 886363,
    "url": "https://api.sofascore.app/api/v1/player/886363/heatmap/overall",
    "file": "assets/heatmaps/886363.png"
  },
  {
    "player": "Lucas Da Cunha",
    "id": 911848,
    "url": "https://api.sofascore.app/api/v1/player/911848/heatmap/overall",
    "file": "assets/heatmaps/911848.png"
  },
  {
    "player": "Adam Daghim",
    "id": 1180758,
    "url": "https://api.sofascore.app/api/v1/player/1180758/heatmap/overall",
    "file": "assets/heatmaps/1180758.png"
  },
  {
    "player": "Finn Dahmen",
    "id": 822564,
    "url": "https://api.sofascore.app/api/v1/player/822564/heatmap/overall",
    "file": "assets/heatmaps/822564.png"
  },
  {
    "player": "Mahmoud Dahoud",
    "id": 341589,
    "url": "https://api.sofascore.app/api/v1/player/341589/heatmap/overall",
    "file": "assets/heatmaps/341589.png"
  },
  {
    "player": "David Daiber",
    "id": 1489220,
    "url": "https://api.sofascore.app/api/v1/player/1489220/heatmap/overall",
    "file": "assets/heatmaps/1489220.png"
  },
  {
    "player": "Ameen Al-Dakhil",
    "id": 1979970,
    "url": "https://api.sofascore.app/api/v1/player/1979970/heatmap/overall",
    "file": "assets/heatmaps/1979970.png"
  },
  {
    "player": "Thijs Dallinga",
    "id": 905381,
    "url": "https://api.sofascore.app/api/v1/player/905381/heatmap/overall",
    "file": "assets/heatmaps/905381.png"
  },
  {
    "player": "Diogo Dalot",
    "id": 843200,
    "url": "https://api.sofascore.app/api/v1/player/843200/heatmap/overall",
    "file": "assets/heatmaps/843200.png"
  },
  {
    "player": "Mikkel Damsgaard",
    "id": 907072,
    "url": "https://api.sofascore.app/api/v1/player/907072/heatmap/overall",
    "file": "assets/heatmaps/907072.png"
  },
  {
    "player": "Arnaut Danjuma",
    "id": 827064,
    "url": "https://api.sofascore.app/api/v1/player/827064/heatmap/overall",
    "file": "assets/heatmaps/827064.png"
  },
  {
    "player": "Kévin Danois",
    "id": 1151803,
    "url": "https://api.sofascore.app/api/v1/player/1151803/heatmap/overall",
    "file": "assets/heatmaps/1151803.png"
  },
  {
    "player": "Kevin Danso",
    "id": 794953,
    "url": "https://api.sofascore.app/api/v1/player/794953/heatmap/overall",
    "file": "assets/heatmaps/794953.png"
  },
  {
    "player": "Dante",
    "id": 3577,
    "url": "https://api.sofascore.app/api/v1/player/3577/heatmap/overall",
    "file": "assets/heatmaps/3577.png"
  },
  {
    "player": "Bence Dárdai",
    "id": 1418624,
    "url": "https://api.sofascore.app/api/v1/player/1418624/heatmap/overall",
    "file": "assets/heatmaps/1418624.png"
  },
  {
    "player": "Sergi Darder",
    "id": 110783,
    "url": "https://api.sofascore.app/api/v1/player/110783/heatmap/overall",
    "file": "assets/heatmaps/110783.png"
  },
  {
    "player": "Karl Darlow",
    "id": 123689,
    "url": "https://api.sofascore.app/api/v1/player/123689/heatmap/overall",
    "file": "assets/heatmaps/123689.png"
  },
  {
    "player": "Matteo Darmian",
    "id": 19352,
    "url": "https://api.sofascore.app/api/v1/player/19352/heatmap/overall",
    "file": "assets/heatmaps/19352.png"
  },
  {
    "player": "David Datro Fofana",
    "id": 1090458,
    "url": "https://api.sofascore.app/api/v1/player/1090458/heatmap/overall",
    "file": "assets/heatmaps/1090458.png"
  },
  {
    "player": "Juan David Cabal",
    "id": 988037,
    "url": "https://api.sofascore.app/api/v1/player/988037/heatmap/overall",
    "file": "assets/heatmaps/988037.png"
  },
  {
    "player": "Jonathan David",
    "id": 935564,
    "url": "https://api.sofascore.app/api/v1/player/935564/heatmap/overall",
    "file": "assets/heatmaps/935564.png"
  },
  {
    "player": "Alphonso Davies",
    "id": 843665,
    "url": "https://api.sofascore.app/api/v1/player/843665/heatmap/overall",
    "file": "assets/heatmaps/843665.png"
  },
  {
    "player": "Ben Davies",
    "id": 94758,
    "url": "https://api.sofascore.app/api/v1/player/94758/heatmap/overall",
    "file": "assets/heatmaps/94758.png"
  },
  {
    "player": "Davinchi",
    "id": 1918369,
    "url": "https://api.sofascore.app/api/v1/player/1918369/heatmap/overall",
    "file": "assets/heatmaps/1918369.png"
  },
  {
    "player": "Keinan Davis",
    "id": 830858,
    "url": "https://api.sofascore.app/api/v1/player/830858/heatmap/overall",
    "file": "assets/heatmaps/830858.png"
  },
  {
    "player": "Kevin De Bruyne",
    "id": 70996,
    "url": "https://api.sofascore.app/api/v1/player/70996/heatmap/overall",
    "file": "assets/heatmaps/70996.png"
  },
  {
    "player": "Mathys De Carvalho",
    "id": 1545023,
    "url": "https://api.sofascore.app/api/v1/player/1545023/heatmap/overall",
    "file": "assets/heatmaps/1545023.png"
  },
  {
    "player": "Maxim De Cuyper",
    "id": 997152,
    "url": "https://api.sofascore.app/api/v1/player/997152/heatmap/overall",
    "file": "assets/heatmaps/997152.png"
  },
  {
    "player": "Charles De Ketelaere",
    "id": 960441,
    "url": "https://api.sofascore.app/api/v1/player/960441/heatmap/overall",
    "file": "assets/heatmaps/960441.png"
  },
  {
    "player": "Jeffrey De Lange",
    "id": 803034,
    "url": "https://api.sofascore.app/api/v1/player/803034/heatmap/overall",
    "file": "assets/heatmaps/803034.png"
  },
  {
    "player": "Théo De Percin",
    "id": 1095836,
    "url": "https://api.sofascore.app/api/v1/player/1095836/heatmap/overall",
    "file": "assets/heatmaps/1095836.png"
  },
  {
    "player": "Lorenzo De Silvestri",
    "id": 14718,
    "url": "https://api.sofascore.app/api/v1/player/14718/heatmap/overall",
    "file": "assets/heatmaps/14718.png"
  },
  {
    "player": "Koni De Winter",
    "id": 1001828,
    "url": "https://api.sofascore.app/api/v1/player/1001828/heatmap/overall",
    "file": "assets/heatmaps/1001828.png"
  },
  {
    "player": "Alessandro Deiola",
    "id": 328109,
    "url": "https://api.sofascore.app/api/v1/player/328109/heatmap/overall",
    "file": "assets/heatmaps/328109.png"
  },
  {
    "player": "Romain Del Castillo",
    "id": 825681,
    "url": "https://api.sofascore.app/api/v1/player/825681/heatmap/overall",
    "file": "assets/heatmaps/825681.png"
  },
  {
    "player": "Enrico Del Prato",
    "id": 928103,
    "url": "https://api.sofascore.app/api/v1/player/928103/heatmap/overall",
    "file": "assets/heatmaps/928103.png"
  },
  {
    "player": "Liam Delap",
    "id": 997087,
    "url": "https://api.sofascore.app/api/v1/player/997087/heatmap/overall",
    "file": "assets/heatmaps/997087.png"
  },
  {
    "player": "Fisayo Dele-Bashiru",
    "id": 910121,
    "url": "https://api.sofascore.app/api/v1/player/910121/heatmap/overall",
    "file": "assets/heatmaps/910121.png"
  },
  {
    "player": "Olivier Deman",
    "id": 960114,
    "url": "https://api.sofascore.app/api/v1/player/960114/heatmap/overall",
    "file": "assets/heatmaps/960114.png"
  },
  {
    "player": "Pape Demba Diop",
    "id": 1410217,
    "url": "https://api.sofascore.app/api/v1/player/1410217/heatmap/overall",
    "file": "assets/heatmaps/1410217.png"
  },
  {
    "player": "Ousmane Dembélé",
    "id": 818244,
    "url": "https://api.sofascore.app/api/v1/player/818244/heatmap/overall",
    "file": "assets/heatmaps/818244.png"
  },
  {
    "player": "Jessy Deminguet",
    "id": 902657,
    "url": "https://api.sofascore.app/api/v1/player/902657/heatmap/overall",
    "file": "assets/heatmaps/902657.png"
  },
  {
    "player": "Ermedin Demirović",
    "id": 878081,
    "url": "https://api.sofascore.app/api/v1/player/878081/heatmap/overall",
    "file": "assets/heatmaps/878081.png"
  },
  {
    "player": "Rav van den Berg",
    "id": 1014493,
    "url": "https://api.sofascore.app/api/v1/player/1014493/heatmap/overall",
    "file": "assets/heatmaps/1014493.png"
  },
  {
    "player": "Sepp van den Berg",
    "id": 924378,
    "url": "https://api.sofascore.app/api/v1/player/924378/heatmap/overall",
    "file": "assets/heatmaps/924378.png"
  },
  {
    "player": "Branco van den Boomen",
    "id": 190883,
    "url": "https://api.sofascore.app/api/v1/player/190883/heatmap/overall",
    "file": "assets/heatmaps/190883.png"
  },
  {
    "player": "Leander Dendoncker",
    "id": 190405,
    "url": "https://api.sofascore.app/api/v1/player/190405/heatmap/overall",
    "file": "assets/heatmaps/190405.png"
  },
  {
    "player": "Daniel Denoon",
    "id": 1922473,
    "url": "https://api.sofascore.app/api/v1/player/1922473/heatmap/overall",
    "file": "assets/heatmaps/1922473.png"
  },
  {
    "player": "Nelson Deossa",
    "id": 1129401,
    "url": "https://api.sofascore.app/api/v1/player/1129401/heatmap/overall",
    "file": "assets/heatmaps/1129401.png"
  },
  {
    "player": "Rémy Descamps",
    "id": 788180,
    "url": "https://api.sofascore.app/api/v1/player/788180/heatmap/overall",
    "file": "assets/heatmaps/788180.png"
  },
  {
    "player": "Bahmed Deuff",
    "id": 1562126,
    "url": "https://api.sofascore.app/api/v1/player/1562126/heatmap/overall",
    "file": "assets/heatmaps/1562126.png"
  },
  {
    "player": "Justin Devenny",
    "id": 1084311,
    "url": "https://api.sofascore.app/api/v1/player/1084311/heatmap/overall",
    "file": "assets/heatmaps/1084311.png"
  },
  {
    "player": "Tidiane Devernois",
    "id": 1927719,
    "url": "https://api.sofascore.app/api/v1/player/1927719/heatmap/overall",
    "file": "assets/heatmaps/1927719.png"
  },
  {
    "player": "Kiernan Dewsbury-Hall",
    "id": 861970,
    "url": "https://api.sofascore.app/api/v1/player/861970/heatmap/overall",
    "file": "assets/heatmaps/861970.png"
  },
  {
    "player": "Michele Di Gregorio",
    "id": 844609,
    "url": "https://api.sofascore.app/api/v1/player/844609/heatmap/overall",
    "file": "assets/heatmaps/844609.png"
  },
  {
    "player": "Giovanni Di Lorenzo",
    "id": 153257,
    "url": "https://api.sofascore.app/api/v1/player/153257/heatmap/overall",
    "file": "assets/heatmaps/153257.png"
  },
  {
    "player": "Boulaye Dia",
    "id": 960080,
    "url": "https://api.sofascore.app/api/v1/player/960080/heatmap/overall",
    "file": "assets/heatmaps/960080.png"
  },
  {
    "player": "Mouctar Diakhaby",
    "id": 797306,
    "url": "https://api.sofascore.app/api/v1/player/797306/heatmap/overall",
    "file": "assets/heatmaps/797306.png"
  },
  {
    "player": "Bafodé Diakité",
    "id": 962408,
    "url": "https://api.sofascore.app/api/v1/player/962408/heatmap/overall",
    "file": "assets/heatmaps/962408.png"
  },
  {
    "player": "Amad Diallo",
    "id": 971037,
    "url": "https://api.sofascore.app/api/v1/player/971037/heatmap/overall",
    "file": "assets/heatmaps/971037.png"
  },
  {
    "player": "Habib Diallo",
    "id": 802159,
    "url": "https://api.sofascore.app/api/v1/player/802159/heatmap/overall",
    "file": "assets/heatmaps/802159.png"
  },
  {
    "player": "Zoumana Diallo",
    "id": 1214843,
    "url": "https://api.sofascore.app/api/v1/player/1214843/heatmap/overall",
    "file": "assets/heatmaps/1214843.png"
  },
  {
    "player": "Grady Diangana",
    "id": 848512,
    "url": "https://api.sofascore.app/api/v1/player/848512/heatmap/overall",
    "file": "assets/heatmaps/848512.png"
  },
  {
    "player": "Assane Diao",
    "id": 1493689,
    "url": "https://api.sofascore.app/api/v1/player/1493689/heatmap/overall",
    "file": "assets/heatmaps/1493689.png"
  },
  {
    "player": "Soriba Diaoune",
    "id": 1936816,
    "url": "https://api.sofascore.app/api/v1/player/1936816/heatmap/overall",
    "file": "assets/heatmaps/1936816.png"
  },
  {
    "player": "Habib Diarra",
    "id": 1128532,
    "url": "https://api.sofascore.app/api/v1/player/1128532/heatmap/overall",
    "file": "assets/heatmaps/1128532.png"
  },
  {
    "player": "Rúben Dias",
    "id": 318941,
    "url": "https://api.sofascore.app/api/v1/player/318941/heatmap/overall",
    "file": "assets/heatmaps/318941.png"
  },
  {
    "player": "Krépin Diatta",
    "id": 873534,
    "url": "https://api.sofascore.app/api/v1/player/873534/heatmap/overall",
    "file": "assets/heatmaps/873534.png"
  },
  {
    "player": "Mory Diaw",
    "id": 580226,
    "url": "https://api.sofascore.app/api/v1/player/580226/heatmap/overall",
    "file": "assets/heatmaps/580226.png"
  },
  {
    "player": "Brahim Díaz",
    "id": 835485,
    "url": "https://api.sofascore.app/api/v1/player/835485/heatmap/overall",
    "file": "assets/heatmaps/835485.png"
  },
  {
    "player": "Julio Diaz",
    "id": 1402990,
    "url": "https://api.sofascore.app/api/v1/player/1402990/heatmap/overall",
    "file": "assets/heatmaps/1402990.png"
  },
  {
    "player": "Junior Diaz",
    "id": 904994,
    "url": "https://api.sofascore.app/api/v1/player/904994/heatmap/overall",
    "file": "assets/heatmaps/904994.png"
  },
  {
    "player": "Luis Díaz",
    "id": 883537,
    "url": "https://api.sofascore.app/api/v1/player/883537/heatmap/overall",
    "file": "assets/heatmaps/883537.png"
  },
  {
    "player": "Pedro Díaz",
    "id": 900669,
    "url": "https://api.sofascore.app/api/v1/player/900669/heatmap/overall",
    "file": "assets/heatmaps/900669.png"
  },
  {
    "player": "Tyler Dibling",
    "id": 1174472,
    "url": "https://api.sofascore.app/api/v1/player/1174472/heatmap/overall",
    "file": "assets/heatmaps/1174472.png"
  },
  {
    "player": "Bamba Dieng",
    "id": 1102503,
    "url": "https://api.sofascore.app/api/v1/player/1102503/heatmap/overall",
    "file": "assets/heatmaps/1102503.png"
  },
  {
    "player": "Eric Dier",
    "id": 146101,
    "url": "https://api.sofascore.app/api/v1/player/146101/heatmap/overall",
    "file": "assets/heatmaps/146101.png"
  },
  {
    "player": "Lucas Digne",
    "id": 96538,
    "url": "https://api.sofascore.app/api/v1/player/96538/heatmap/overall",
    "file": "assets/heatmaps/96538.png"
  },
  {
    "player": "Kevin Diks",
    "id": 583806,
    "url": "https://api.sofascore.app/api/v1/player/583806/heatmap/overall",
    "file": "assets/heatmaps/583806.png"
  },
  {
    "player": "Federico Dimarco",
    "id": 284361,
    "url": "https://api.sofascore.app/api/v1/player/284361/heatmap/overall",
    "file": "assets/heatmaps/284361.png"
  },
  {
    "player": "Stole Dimitrievski",
    "id": 97951,
    "url": "https://api.sofascore.app/api/v1/player/97951/heatmap/overall",
    "file": "assets/heatmaps/97951.png"
  },
  {
    "player": "Junior Dina Ebimbe",
    "id": 904994,
    "url": "https://api.sofascore.app/api/v1/player/904994/heatmap/overall",
    "file": "assets/heatmaps/904994.png"
  },
  {
    "player": "Sinaly Diomande",
    "id": 996951,
    "url": "https://api.sofascore.app/api/v1/player/996951/heatmap/overall",
    "file": "assets/heatmaps/996951.png"
  },
  {
    "player": "Yan Diomandé",
    "id": 2087085,
    "url": "https://api.sofascore.app/api/v1/player/2087085/heatmap/overall",
    "file": "assets/heatmaps/2087085.png"
  },
  {
    "player": "Issa Diop",
    "id": 825719,
    "url": "https://api.sofascore.app/api/v1/player/825719/heatmap/overall",
    "file": "assets/heatmaps/825719.png"
  },
  {
    "player": "Sérigné Diop",
    "id": 1922996,
    "url": "https://api.sofascore.app/api/v1/player/1922996/heatmap/overall",
    "file": "assets/heatmaps/1922996.png"
  },
  {
    "player": "Sofiane Diop",
    "id": 944164,
    "url": "https://api.sofascore.app/api/v1/player/944164/heatmap/overall",
    "file": "assets/heatmaps/944164.png"
  },
  {
    "player": "El Hadji Malick Diouf",
    "id": 1471764,
    "url": "https://api.sofascore.app/api/v1/player/1471764/heatmap/overall",
    "file": "assets/heatmaps/1471764.png"
  },
  {
    "player": "Yehvann Diouf",
    "id": 845183,
    "url": "https://api.sofascore.app/api/v1/player/845183/heatmap/overall",
    "file": "assets/heatmaps/845183.png"
  },
  {
    "player": "Assane Dioussé",
    "id": 782240,
    "url": "https://api.sofascore.app/api/v1/player/782240/heatmap/overall",
    "file": "assets/heatmaps/782240.png"
  },
  {
    "player": "Axel Disasi",
    "id": 827243,
    "url": "https://api.sofascore.app/api/v1/player/827243/heatmap/overall",
    "file": "assets/heatmaps/827243.png"
  },
  {
    "player": "Matías Dituro",
    "id": 556884,
    "url": "https://api.sofascore.app/api/v1/player/556884/heatmap/overall",
    "file": "assets/heatmaps/556884.png"
  },
  {
    "player": "Djené",
    "id": 307702,
    "url": "https://api.sofascore.app/api/v1/player/307702/heatmap/overall",
    "file": "assets/heatmaps/307702.png"
  },
  {
    "player": "Harouna Djibrin",
    "id": 2318284,
    "url": "https://api.sofascore.app/api/v1/player/2318284/heatmap/overall",
    "file": "assets/heatmaps/2318284.png"
  },
  {
    "player": "Berat Djimsiti",
    "id": 151003,
    "url": "https://api.sofascore.app/api/v1/player/151003/heatmap/overall",
    "file": "assets/heatmaps/151003.png"
  },
  {
    "player": "Marko Dmitrović",
    "id": 94527,
    "url": "https://api.sofascore.app/api/v1/player/94527/heatmap/overall",
    "file": "assets/heatmaps/94527.png"
  },
  {
    "player": "Ritsu Doan",
    "id": 790965,
    "url": "https://api.sofascore.app/api/v1/player/790965/heatmap/overall",
    "file": "assets/heatmaps/790965.png"
  },
  {
    "player": "Dodô",
    "id": 822518,
    "url": "https://api.sofascore.app/api/v1/player/822518/heatmap/overall",
    "file": "assets/heatmaps/822518.png"
  },
  {
    "player": "Danilho Doekhi",
    "id": 830803,
    "url": "https://api.sofascore.app/api/v1/player/830803/heatmap/overall",
    "file": "assets/heatmaps/830803.png"
  },
  {
    "player": "Matt Doherty",
    "id": 143047,
    "url": "https://api.sofascore.app/api/v1/player/143047/heatmap/overall",
    "file": "assets/heatmaps/143047.png"
  },
  {
    "player": "Josh Doig",
    "id": 989276,
    "url": "https://api.sofascore.app/api/v1/player/989276/heatmap/overall",
    "file": "assets/heatmaps/989276.png"
  },
  {
    "player": "Jeremy Doku",
    "id": 934386,
    "url": "https://api.sofascore.app/api/v1/player/934386/heatmap/overall",
    "file": "assets/heatmaps/934386.png"
  },
  {
    "player": "Tyrhys Dolan",
    "id": 1063015,
    "url": "https://api.sofascore.app/api/v1/player/1063015/heatmap/overall",
    "file": "assets/heatmaps/1063015.png"
  },
  {
    "player": "Benjamín Domínguez",
    "id": 1162611,
    "url": "https://api.sofascore.app/api/v1/player/1162611/heatmap/overall",
    "file": "assets/heatmaps/1162611.png"
  },
  {
    "player": "Carlos Dominguez",
    "id": 1069703,
    "url": "https://api.sofascore.app/api/v1/player/1069703/heatmap/overall",
    "file": "assets/heatmaps/1069703.png"
  },
  {
    "player": "Nicolás Domínguez",
    "id": 871765,
    "url": "https://api.sofascore.app/api/v1/player/871765/heatmap/overall",
    "file": "assets/heatmaps/871765.png"
  },
  {
    "player": "Jean-Luc Dompé",
    "id": 789192,
    "url": "https://api.sofascore.app/api/v1/player/789192/heatmap/overall",
    "file": "assets/heatmaps/789192.png"
  },
  {
    "player": "John Donald",
    "id": 1094758,
    "url": "https://api.sofascore.app/api/v1/player/1094758/heatmap/overall",
    "file": "assets/heatmaps/1094758.png"
  },
  {
    "player": "Gianluigi Donnarumma",
    "id": 824509,
    "url": "https://api.sofascore.app/api/v1/player/824509/heatmap/overall",
    "file": "assets/heatmaps/824509.png"
  },
  {
    "player": "Romelle Donovan",
    "id": 1586020,
    "url": "https://api.sofascore.app/api/v1/player/1586020/heatmap/overall",
    "file": "assets/heatmaps/1586020.png"
  },
  {
    "player": "Patrick Dorgu",
    "id": 1397168,
    "url": "https://api.sofascore.app/api/v1/player/1397168/heatmap/overall",
    "file": "assets/heatmaps/1397168.png"
  },
  {
    "player": "Niklas Dorsch",
    "id": 794995,
    "url": "https://api.sofascore.app/api/v1/player/794995/heatmap/overall",
    "file": "assets/heatmaps/794995.png"
  },
  {
    "player": "Alberto Dossena",
    "id": 870211,
    "url": "https://api.sofascore.app/api/v1/player/870211/heatmap/overall",
    "file": "assets/heatmaps/870211.png"
  },
  {
    "player": "Fodé Doucouré",
    "id": 1035695,
    "url": "https://api.sofascore.app/api/v1/player/1035695/heatmap/overall",
    "file": "assets/heatmaps/1035695.png"
  },
  {
    "player": "Sékou Doucoure",
    "id": 1415436,
    "url": "https://api.sofascore.app/api/v1/player/1415436/heatmap/overall",
    "file": "assets/heatmaps/1415436.png"
  },
  {
    "player": "Désiré Doué",
    "id": 1154605,
    "url": "https://api.sofascore.app/api/v1/player/1154605/heatmap/overall",
    "file": "assets/heatmaps/1154605.png"
  },
  {
    "player": "Guela Doué",
    "id": 1002033,
    "url": "https://api.sofascore.app/api/v1/player/1002033/heatmap/overall",
    "file": "assets/heatmaps/1002033.png"
  },
  {
    "player": "Ismaël Doukouré",
    "id": 1049517,
    "url": "https://api.sofascore.app/api/v1/player/1049517/heatmap/overall",
    "file": "assets/heatmaps/1049517.png"
  },
  {
    "player": "Kamory Doumbia",
    "id": 1156353,
    "url": "https://api.sofascore.app/api/v1/player/1156353/heatmap/overall",
    "file": "assets/heatmaps/1156353.png"
  },
  {
    "player": "Anastasios Douvikas",
    "id": 894863,
    "url": "https://api.sofascore.app/api/v1/player/894863/heatmap/overall",
    "file": "assets/heatmaps/894863.png"
  },
  {
    "player": "Artem Dovbyk",
    "id": 798820,
    "url": "https://api.sofascore.app/api/v1/player/798820/heatmap/overall",
    "file": "assets/heatmaps/798820.png"
  },
  {
    "player": "Max Dowman",
    "id": 1917626,
    "url": "https://api.sofascore.app/api/v1/player/1917626/heatmap/overall",
    "file": "assets/heatmaps/1917626.png"
  },
  {
    "player": "Damion Downs",
    "id": 1146091,
    "url": "https://api.sofascore.app/api/v1/player/1146091/heatmap/overall",
    "file": "assets/heatmaps/1146091.png"
  },
  {
    "player": "Radu Drăgușin",
    "id": 997103,
    "url": "https://api.sofascore.app/api/v1/player/997103/heatmap/overall",
    "file": "assets/heatmaps/997103.png"
  },
  {
    "player": "Joél Drakes-Thomas",
    "id": 2007717,
    "url": "https://api.sofascore.app/api/v1/player/2007717/heatmap/overall",
    "file": "assets/heatmaps/2007717.png"
  },
  {
    "player": "Domingos Duarte",
    "id": 576276,
    "url": "https://api.sofascore.app/api/v1/player/576276/heatmap/overall",
    "file": "assets/heatmaps/576276.png"
  },
  {
    "player": "Martin Dúbravka",
    "id": 42209,
    "url": "https://api.sofascore.app/api/v1/player/42209/heatmap/overall",
    "file": "assets/heatmaps/42209.png"
  },
  {
    "player": "Denzel Dumfries",
    "id": 759520,
    "url": "https://api.sofascore.app/api/v1/player/759520/heatmap/overall",
    "file": "assets/heatmaps/759520.png"
  },
  {
    "player": "Lewis Dunk",
    "id": 115365,
    "url": "https://api.sofascore.app/api/v1/player/115365/heatmap/overall",
    "file": "assets/heatmaps/115365.png"
  },
  {
    "player": "Maxime Dupé",
    "id": 96542,
    "url": "https://api.sofascore.app/api/v1/player/96542/heatmap/overall",
    "file": "assets/heatmaps/96542.png"
  },
  {
    "player": "Pablo Durán",
    "id": 1398524,
    "url": "https://api.sofascore.app/api/v1/player/1398524/heatmap/overall",
    "file": "assets/heatmaps/1398524.png"
  },
  {
    "player": "Hugo Duro",
    "id": 909119,
    "url": "https://api.sofascore.app/api/v1/player/909119/heatmap/overall",
    "file": "assets/heatmaps/909119.png"
  },
  {
    "player": "Rafiu Durosinmi",
    "id": 1152386,
    "url": "https://api.sofascore.app/api/v1/player/1152386/heatmap/overall",
    "file": "assets/heatmaps/1152386.png"
  },
  {
    "player": "Paulo Dybala",
    "id": 256219,
    "url": "https://api.sofascore.app/api/v1/player/256219/heatmap/overall",
    "file": "assets/heatmaps/256219.png"
  },
  {
    "player": "Adam Dźwigała",
    "id": 252343,
    "url": "https://api.sofascore.app/api/v1/player/252343/heatmap/overall",
    "file": "assets/heatmaps/252343.png"
  },
  {
    "player": "Aron Dønnum",
    "id": 863133,
    "url": "https://api.sofascore.app/api/v1/player/863133/heatmap/overall",
    "file": "assets/heatmaps/863133.png"
  },
  {
    "player": "Younes Ebnoutalib",
    "id": 1474296,
    "url": "https://api.sofascore.app/api/v1/player/1474296/heatmap/overall",
    "file": "assets/heatmaps/1474296.png"
  },
  {
    "player": "Simon Ebonog",
    "id": 1490783,
    "url": "https://api.sofascore.app/api/v1/player/1490783/heatmap/overall",
    "file": "assets/heatmaps/1490783.png"
  },
  {
    "player": "Enzo Ebosse",
    "id": 848279,
    "url": "https://api.sofascore.app/api/v1/player/848279/heatmap/overall",
    "file": "assets/heatmaps/848279.png"
  },
  {
    "player": "Éderson",
    "id": 946888,
    "url": "https://api.sofascore.app/api/v1/player/946888/heatmap/overall",
    "file": "assets/heatmaps/946888.png"
  },
  {
    "player": "Noah Edjouma",
    "id": 1512354,
    "url": "https://api.sofascore.app/api/v1/player/1512354/heatmap/overall",
    "file": "assets/heatmaps/1512354.png"
  },
  {
    "player": "Andrias Edmundsson",
    "id": 906963,
    "url": "https://api.sofascore.app/api/v1/player/906963/heatmap/overall",
    "file": "assets/heatmaps/906963.png"
  },
  {
    "player": "Odsonne Édouard",
    "id": 795228,
    "url": "https://api.sofascore.app/api/v1/player/795228/heatmap/overall",
    "file": "assets/heatmaps/795228.png"
  },
  {
    "player": "Tom Edozie",
    "id": 1445189,
    "url": "https://api.sofascore.app/api/v1/player/1445189/heatmap/overall",
    "file": "assets/heatmaps/1445189.png"
  },
  {
    "player": "Alysson Edward",
    "id": 1631879,
    "url": "https://api.sofascore.app/api/v1/player/1631879/heatmap/overall",
    "file": "assets/heatmaps/1631879.png"
  },
  {
    "player": "Marcus Edwards",
    "id": 795066,
    "url": "https://api.sofascore.app/api/v1/player/795066/heatmap/overall",
    "file": "assets/heatmaps/795066.png"
  },
  {
    "player": "CJ Egan-Riley",
    "id": 1131448,
    "url": "https://api.sofascore.app/api/v1/player/1131448/heatmap/overall",
    "file": "assets/heatmaps/1131448.png"
  },
  {
    "player": "Maximilian Eggestein",
    "id": 569784,
    "url": "https://api.sofascore.app/api/v1/player/569784/heatmap/overall",
    "file": "assets/heatmaps/569784.png"
  },
  {
    "player": "Kingsley Ehizibue",
    "id": 609206,
    "url": "https://api.sofascore.app/api/v1/player/609206/heatmap/overall",
    "file": "assets/heatmaps/609206.png"
  },
  {
    "player": "Ovie Ejaria",
    "id": 845025,
    "url": "https://api.sofascore.app/api/v1/player/845025/heatmap/overall",
    "file": "assets/heatmaps/845025.png"
  },
  {
    "player": "Chidera Ejuke",
    "id": 875890,
    "url": "https://api.sofascore.app/api/v1/player/875890/heatmap/overall",
    "file": "assets/heatmaps/875890.png"
  },
  {
    "player": "Hjalmar Ekdal",
    "id": 875360,
    "url": "https://api.sofascore.app/api/v1/player/875360/heatmap/overall",
    "file": "assets/heatmaps/875360.png"
  },
  {
    "player": "Jeff Ekhator",
    "id": 1613917,
    "url": "https://api.sofascore.app/api/v1/player/1613917/heatmap/overall",
    "file": "assets/heatmaps/1613917.png"
  },
  {
    "player": "Hugo Ekitike",
    "id": 1048422,
    "url": "https://api.sofascore.app/api/v1/player/1048422/heatmap/overall",
    "file": "assets/heatmaps/1048422.png"
  },
  {
    "player": "Jurgen Ekkelenkamp",
    "id": 904887,
    "url": "https://api.sofascore.app/api/v1/player/904887/heatmap/overall",
    "file": "assets/heatmaps/904887.png"
  },
  {
    "player": "Jacques Ekomie",
    "id": 1170532,
    "url": "https://api.sofascore.app/api/v1/player/1170532/heatmap/overall",
    "file": "assets/heatmaps/1170532.png"
  },
  {
    "player": "Caleb Ekuban",
    "id": 309156,
    "url": "https://api.sofascore.app/api/v1/player/309156/heatmap/overall",
    "file": "assets/heatmaps/309156.png"
  },
  {
    "player": "Anthony Elanga",
    "id": 979232,
    "url": "https://api.sofascore.app/api/v1/player/979232/heatmap/overall",
    "file": "assets/heatmaps/979232.png"
  },
  {
    "player": "Daniel Elfadli",
    "id": 945532,
    "url": "https://api.sofascore.app/api/v1/player/945532/heatmap/overall",
    "file": "assets/heatmaps/945532.png"
  },
  {
    "player": "Unai Elgezabal",
    "id": 813574,
    "url": "https://api.sofascore.app/api/v1/player/813574/heatmap/overall",
    "file": "assets/heatmaps/813574.png"
  },
  {
    "player": "Melker Ellborg",
    "id": 1099795,
    "url": "https://api.sofascore.app/api/v1/player/1099795/heatmap/overall",
    "file": "assets/heatmaps/1099795.png"
  },
  {
    "player": "Mikael Ellertsson",
    "id": 933203,
    "url": "https://api.sofascore.app/api/v1/player/933203/heatmap/overall",
    "file": "assets/heatmaps/933203.png"
  },
  {
    "player": "Harvey Elliott",
    "id": 955245,
    "url": "https://api.sofascore.app/api/v1/player/955245/heatmap/overall",
    "file": "assets/heatmaps/955245.png"
  },
  {
    "player": "Elif Elmas",
    "id": 838232,
    "url": "https://api.sofascore.app/api/v1/player/838232/heatmap/overall",
    "file": "assets/heatmaps/838232.png"
  },
  {
    "player": "Nesta Elphege",
    "id": 1486729,
    "url": "https://api.sofascore.app/api/v1/player/1486729/heatmap/overall",
    "file": "assets/heatmaps/1486729.png"
  },
  {
    "player": "Aritz Elustondo",
    "id": 785468,
    "url": "https://api.sofascore.app/api/v1/player/785468/heatmap/overall",
    "file": "assets/heatmaps/785468.png"
  },
  {
    "player": "Nico Elvedi",
    "id": 282229,
    "url": "https://api.sofascore.app/api/v1/player/282229/heatmap/overall",
    "file": "assets/heatmaps/282229.png"
  },
  {
    "player": "Breel Embolo",
    "id": 352296,
    "url": "https://api.sofascore.app/api/v1/player/352296/heatmap/overall",
    "file": "assets/heatmaps/352296.png"
  },
  {
    "player": "Emanuel Emegha",
    "id": 1048333,
    "url": "https://api.sofascore.app/api/v1/player/1048333/heatmap/overall",
    "file": "assets/heatmaps/1048333.png"
  },
  {
    "player": "Emersonn",
    "id": 1128844,
    "url": "https://api.sofascore.app/api/v1/player/1128844/heatmap/overall",
    "file": "assets/heatmaps/1128844.png"
  },
  {
    "player": "Julio Enciso",
    "id": 973556,
    "url": "https://api.sofascore.app/api/v1/player/973556/heatmap/overall",
    "file": "assets/heatmaps/973556.png"
  },
  {
    "player": "Wataru Endo",
    "id": 143040,
    "url": "https://api.sofascore.app/api/v1/player/143040/heatmap/overall",
    "file": "assets/heatmaps/143040.png"
  },
  {
    "player": "Endrick",
    "id": 1174937,
    "url": "https://api.sofascore.app/api/v1/player/1174937/heatmap/overall",
    "file": "assets/heatmaps/1174937.png"
  },
  {
    "player": "Yannik Engelhardt",
    "id": 990209,
    "url": "https://api.sofascore.app/api/v1/player/990209/heatmap/overall",
    "file": "assets/heatmaps/990209.png"
  },
  {
    "player": "Christian Eriksen",
    "id": 105734,
    "url": "https://api.sofascore.app/api/v1/player/105734/heatmap/overall",
    "file": "assets/heatmaps/105734.png"
  },
  {
    "player": "Aarón Escandell",
    "id": 368922,
    "url": "https://api.sofascore.app/api/v1/player/368922/heatmap/overall",
    "file": "assets/heatmaps/368922.png"
  },
  {
    "player": "Xavi Espart",
    "id": 1546073,
    "url": "https://api.sofascore.app/api/v1/player/1546073/heatmap/overall",
    "file": "assets/heatmaps/1546073.png"
  },
  {
    "player": "Carlos Espí",
    "id": 1649918,
    "url": "https://api.sofascore.app/api/v1/player/1649918/heatmap/overall",
    "file": "assets/heatmaps/1649918.png"
  },
  {
    "player": "Alfonso Espino",
    "id": 542634,
    "url": "https://api.sofascore.app/api/v1/player/542634/heatmap/overall",
    "file": "assets/heatmaps/542634.png"
  },
  {
    "player": "Francesco Esposito",
    "id": 1156616,
    "url": "https://api.sofascore.app/api/v1/player/1156616/heatmap/overall",
    "file": "assets/heatmaps/1156616.png"
  },
  {
    "player": "Sebastiano Esposito",
    "id": 965008,
    "url": "https://api.sofascore.app/api/v1/player/965008/heatmap/overall",
    "file": "assets/heatmaps/965008.png"
  },
  {
    "player": "Marco Esteban",
    "id": 1548439,
    "url": "https://api.sofascore.app/api/v1/player/1548439/heatmap/overall",
    "file": "assets/heatmaps/1548439.png"
  },
  {
    "player": "Maxime Estève",
    "id": 1117223,
    "url": "https://api.sofascore.app/api/v1/player/1117223/heatmap/overall",
    "file": "assets/heatmaps/1117223.png"
  },
  {
    "player": "Nahuel Estévez",
    "id": 895868,
    "url": "https://api.sofascore.app/api/v1/player/895868/heatmap/overall",
    "file": "assets/heatmaps/895868.png"
  },
  {
    "player": "Pervis Estupiñán",
    "id": 805465,
    "url": "https://api.sofascore.app/api/v1/player/805465/heatmap/overall",
    "file": "assets/heatmaps/805465.png"
  },
  {
    "player": "Karl Etta Eyong",
    "id": 1393673,
    "url": "https://api.sofascore.app/api/v1/player/1393673/heatmap/overall",
    "file": "assets/heatmaps/1393673.png"
  },
  {
    "player": "Evanilson",
    "id": 998490,
    "url": "https://api.sofascore.app/api/v1/player/998490/heatmap/overall",
    "file": "assets/heatmaps/998490.png"
  },
  {
    "player": "Edu Expósito",
    "id": 877262,
    "url": "https://api.sofascore.app/api/v1/player/877262/heatmap/overall",
    "file": "assets/heatmaps/877262.png"
  },
  {
    "player": "Abde Ezzalzouli",
    "id": 1011375,
    "url": "https://api.sofascore.app/api/v1/player/1011375/heatmap/overall",
    "file": "assets/heatmaps/1011375.png"
  },
  {
    "player": "Giovanni Fabbian",
    "id": 1067204,
    "url": "https://api.sofascore.app/api/v1/player/1067204/heatmap/overall",
    "file": "assets/heatmaps/1067204.png"
  },
  {
    "player": "Alieu Fadera",
    "id": 1031548,
    "url": "https://api.sofascore.app/api/v1/player/1031548/heatmap/overall",
    "file": "assets/heatmaps/1031548.png"
  },
  {
    "player": "Wout Faes",
    "id": 361696,
    "url": "https://api.sofascore.app/api/v1/player/361696/heatmap/overall",
    "file": "assets/heatmaps/361696.png"
  },
  {
    "player": "Nicolò Fagioli",
    "id": 901850,
    "url": "https://api.sofascore.app/api/v1/player/901850/heatmap/overall",
    "file": "assets/heatmaps/901850.png"
  },
  {
    "player": "Romain Faivre",
    "id": 913942,
    "url": "https://api.sofascore.app/api/v1/player/913942/heatmap/overall",
    "file": "assets/heatmaps/913942.png"
  },
  {
    "player": "Omar Falah",
    "id": 2115056,
    "url": "https://api.sofascore.app/api/v1/player/2115056/heatmap/overall",
    "file": "assets/heatmaps/2115056.png"
  },
  {
    "player": "Wladimiro Falcone",
    "id": 256667,
    "url": "https://api.sofascore.app/api/v1/player/256667/heatmap/overall",
    "file": "assets/heatmaps/256667.png"
  },
  {
    "player": "Ansu Fati",
    "id": 962883,
    "url": "https://api.sofascore.app/api/v1/player/962883/heatmap/overall",
    "file": "assets/heatmaps/962883.png"
  },
  {
    "player": "Abdoulaye Faye",
    "id": 1529051,
    "url": "https://api.sofascore.app/api/v1/player/1529051/heatmap/overall",
    "file": "assets/heatmaps/1529051.png"
  },
  {
    "player": "Jacopo Fazzini",
    "id": 1012179,
    "url": "https://api.sofascore.app/api/v1/player/1012179/heatmap/overall",
    "file": "assets/heatmaps/1012179.png"
  },
  {
    "player": "Aleix Febas",
    "id": 286167,
    "url": "https://api.sofascore.app/api/v1/player/286167/heatmap/overall",
    "file": "assets/heatmaps/286167.png"
  },
  {
    "player": "Mattia Felici",
    "id": 975811,
    "url": "https://api.sofascore.app/api/v1/player/975811/heatmap/overall",
    "file": "assets/heatmaps/975811.png"
  },
  {
    "player": "Luiz Felipe",
    "id": 850035,
    "url": "https://api.sofascore.app/api/v1/player/850035/heatmap/overall",
    "file": "assets/heatmaps/850035.png"
  },
  {
    "player": "Frank Feller",
    "id": 1083359,
    "url": "https://api.sofascore.app/api/v1/player/1083359/heatmap/overall",
    "file": "assets/heatmaps/1083359.png"
  },
  {
    "player": "Robin Fellhauer",
    "id": 860461,
    "url": "https://api.sofascore.app/api/v1/player/860461/heatmap/overall",
    "file": "assets/heatmaps/860461.png"
  },
  {
    "player": "Kiko Femenía",
    "id": 53739,
    "url": "https://api.sofascore.app/api/v1/player/53739/heatmap/overall",
    "file": "assets/heatmaps/53739.png"
  },
  {
    "player": "Evan Ferguson",
    "id": 999231,
    "url": "https://api.sofascore.app/api/v1/player/999231/heatmap/overall",
    "file": "assets/heatmaps/999231.png"
  },
  {
    "player": "Lewis Ferguson",
    "id": 907152,
    "url": "https://api.sofascore.app/api/v1/player/907152/heatmap/overall",
    "file": "assets/heatmaps/907152.png"
  },
  {
    "player": "Bruno Fernandes",
    "id": 288205,
    "url": "https://api.sofascore.app/api/v1/player/288205/heatmap/overall",
    "file": "assets/heatmaps/288205.png"
  },
  {
    "player": "Mateus Fernandes",
    "id": 1142562,
    "url": "https://api.sofascore.app/api/v1/player/1142562/heatmap/overall",
    "file": "assets/heatmaps/1142562.png"
  },
  {
    "player": "Dro Fernández",
    "id": 1926085,
    "url": "https://api.sofascore.app/api/v1/player/1926085/heatmap/overall",
    "file": "assets/heatmaps/1926085.png"
  },
  {
    "player": "Enzo Fernández",
    "id": 974505,
    "url": "https://api.sofascore.app/api/v1/player/974505/heatmap/overall",
    "file": "assets/heatmaps/974505.png"
  },
  {
    "player": "Ezequiél Fernández",
    "id": 1003012,
    "url": "https://api.sofascore.app/api/v1/player/1003012/heatmap/overall",
    "file": "assets/heatmaps/1003012.png"
  },
  {
    "player": "Manu Fernández",
    "id": 1630975,
    "url": "https://api.sofascore.app/api/v1/player/1630975/heatmap/overall",
    "file": "assets/heatmaps/1630975.png"
  },
  {
    "player": "Roberto Férnandez",
    "id": 1392592,
    "url": "https://api.sofascore.app/api/v1/player/1392592/heatmap/overall",
    "file": "assets/heatmaps/1392592.png"
  },
  {
    "player": "Thiago Fernández",
    "id": 1201412,
    "url": "https://api.sofascore.app/api/v1/player/1201412/heatmap/overall",
    "file": "assets/heatmaps/1201412.png"
  },
  {
    "player": "Toni Fernández",
    "id": 1590761,
    "url": "https://api.sofascore.app/api/v1/player/1590761/heatmap/overall",
    "file": "assets/heatmaps/1590761.png"
  },
  {
    "player": "Matias Fernandez-Pardo",
    "id": 1149144,
    "url": "https://api.sofascore.app/api/v1/player/1149144/heatmap/overall",
    "file": "assets/heatmaps/1149144.png"
  },
  {
    "player": "Álvaro Fidalgo",
    "id": 838629,
    "url": "https://api.sofascore.app/api/v1/player/838629/heatmap/overall",
    "file": "assets/heatmaps/838629.png"
  },
  {
    "player": "Max Finkgräfe",
    "id": 1146250,
    "url": "https://api.sofascore.app/api/v1/player/1146250/heatmap/overall",
    "file": "assets/heatmaps/1146250.png"
  },
  {
    "player": "Junior Firpo",
    "id": 914835,
    "url": "https://api.sofascore.app/api/v1/player/914835/heatmap/overall",
    "file": "assets/heatmaps/914835.png"
  },
  {
    "player": "Jonathan Fischer",
    "id": 1004550,
    "url": "https://api.sofascore.app/api/v1/player/1004550/heatmap/overall",
    "file": "assets/heatmaps/1004550.png"
  },
  {
    "player": "Kilian Fischer",
    "id": 995316,
    "url": "https://api.sofascore.app/api/v1/player/995316/heatmap/overall",
    "file": "assets/heatmaps/995316.png"
  },
  {
    "player": "Mark Flekken",
    "id": 171919,
    "url": "https://api.sofascore.app/api/v1/player/171919/heatmap/overall",
    "file": "assets/heatmaps/171919.png"
  },
  {
    "player": "Zian Flemming",
    "id": 875137,
    "url": "https://api.sofascore.app/api/v1/player/875137/heatmap/overall",
    "file": "assets/heatmaps/875137.png"
  },
  {
    "player": "Jack Fletcher",
    "id": 1402726,
    "url": "https://api.sofascore.app/api/v1/player/1402726/heatmap/overall",
    "file": "assets/heatmaps/1402726.png"
  },
  {
    "player": "Tyler Fletcher",
    "id": 1402850,
    "url": "https://api.sofascore.app/api/v1/player/1402850/heatmap/overall",
    "file": "assets/heatmaps/1402850.png"
  },
  {
    "player": "Romano Floriani",
    "id": 1100354,
    "url": "https://api.sofascore.app/api/v1/player/1100354/heatmap/overall",
    "file": "assets/heatmaps/1100354.png"
  },
  {
    "player": "Phil Foden",
    "id": 859765,
    "url": "https://api.sofascore.app/api/v1/player/859765/heatmap/overall",
    "file": "assets/heatmaps/859765.png"
  },
  {
    "player": "Malick Fofana",
    "id": 1195784,
    "url": "https://api.sofascore.app/api/v1/player/1195784/heatmap/overall",
    "file": "assets/heatmaps/1195784.png"
  },
  {
    "player": "Rayan Fofana",
    "id": 1545376,
    "url": "https://api.sofascore.app/api/v1/player/1545376/heatmap/overall",
    "file": "assets/heatmaps/1545376.png"
  },
  {
    "player": "Sadik Fofana",
    "id": 1130662,
    "url": "https://api.sofascore.app/api/v1/player/1130662/heatmap/overall",
    "file": "assets/heatmaps/1130662.png"
  },
  {
    "player": "Wesley Fofana",
    "id": 923894,
    "url": "https://api.sofascore.app/api/v1/player/923894/heatmap/overall",
    "file": "assets/heatmaps/923894.png"
  },
  {
    "player": "Youssouf Fofana",
    "id": 945062,
    "url": "https://api.sofascore.app/api/v1/player/945062/heatmap/overall",
    "file": "assets/heatmaps/945062.png"
  },
  {
    "player": "Jonas Föhrenbach",
    "id": 311676,
    "url": "https://api.sofascore.app/api/v1/player/311676/heatmap/overall",
    "file": "assets/heatmaps/311676.png"
  },
  {
    "player": "Francesco Folino",
    "id": 1424353,
    "url": "https://api.sofascore.app/api/v1/player/1424353/heatmap/overall",
    "file": "assets/heatmaps/1424353.png"
  },
  {
    "player": "Michael Folorunsho",
    "id": 869795,
    "url": "https://api.sofascore.app/api/v1/player/869795/heatmap/overall",
    "file": "assets/heatmaps/869795.png"
  },
  {
    "player": "Nicolas Fonseca",
    "id": 944629,
    "url": "https://api.sofascore.app/api/v1/player/944629/heatmap/overall",
    "file": "assets/heatmaps/944629.png"
  },
  {
    "player": "Álex Forés",
    "id": 1086128,
    "url": "https://api.sofascore.app/api/v1/player/1086128/heatmap/overall",
    "file": "assets/heatmaps/1086128.png"
  },
  {
    "player": "Pablo Fornals",
    "id": 816763,
    "url": "https://api.sofascore.app/api/v1/player/816763/heatmap/overall",
    "file": "assets/heatmaps/816763.png"
  },
  {
    "player": "Héctor Fort",
    "id": 1402908,
    "url": "https://api.sofascore.app/api/v1/player/1402908/heatmap/overall",
    "file": "assets/heatmaps/1402908.png"
  },
  {
    "player": "Niccolò Fortini",
    "id": 1526934,
    "url": "https://api.sofascore.app/api/v1/player/1526934/heatmap/overall",
    "file": "assets/heatmaps/1526934.png"
  },
  {
    "player": "Lyle Foster",
    "id": 901907,
    "url": "https://api.sofascore.app/api/v1/player/901907/heatmap/overall",
    "file": "assets/heatmaps/901907.png"
  },
  {
    "player": "Dimitri Foulquier",
    "id": 151138,
    "url": "https://api.sofascore.app/api/v1/player/151138/heatmap/overall",
    "file": "assets/heatmaps/151138.png"
  },
  {
    "player": "Juan Foyth",
    "id": 873189,
    "url": "https://api.sofascore.app/api/v1/player/873189/heatmap/overall",
    "file": "assets/heatmaps/873189.png"
  },
  {
    "player": "Alejandro Francés",
    "id": 1002347,
    "url": "https://api.sofascore.app/api/v1/player/1002347/heatmap/overall",
    "file": "assets/heatmaps/1002347.png"
  },
  {
    "player": "Przemysław Frankowski",
    "id": 286909,
    "url": "https://api.sofascore.app/api/v1/player/286909/heatmap/overall",
    "file": "assets/heatmaps/286909.png"
  },
  {
    "player": "Davide Frattesi",
    "id": 835600,
    "url": "https://api.sofascore.app/api/v1/player/835600/heatmap/overall",
    "file": "assets/heatmaps/835600.png"
  },
  {
    "player": "Tyler Fredricson",
    "id": 1142182,
    "url": "https://api.sofascore.app/api/v1/player/1142182/heatmap/overall",
    "file": "assets/heatmaps/1142182.png"
  },
  {
    "player": "Morten Frendrup",
    "id": 918440,
    "url": "https://api.sofascore.app/api/v1/player/918440/heatmap/overall",
    "file": "assets/heatmaps/918440.png"
  },
  {
    "player": "Martin Frese",
    "id": 874812,
    "url": "https://api.sofascore.app/api/v1/player/874812/heatmap/overall",
    "file": "assets/heatmaps/874812.png"
  },
  {
    "player": "Remo Freuler",
    "id": 115516,
    "url": "https://api.sofascore.app/api/v1/player/115516/heatmap/overall",
    "file": "assets/heatmaps/115516.png"
  },
  {
    "player": "Marco Friedl",
    "id": 825771,
    "url": "https://api.sofascore.app/api/v1/player/825771/heatmap/overall",
    "file": "assets/heatmaps/825771.png"
  },
  {
    "player": "Marvin Friedrich",
    "id": 254449,
    "url": "https://api.sofascore.app/api/v1/player/254449/heatmap/overall",
    "file": "assets/heatmaps/254449.png"
  },
  {
    "player": "Jeremie Frimpong",
    "id": 970361,
    "url": "https://api.sofascore.app/api/v1/player/970361/heatmap/overall",
    "file": "assets/heatmaps/970361.png"
  },
  {
    "player": "Jorge de Frutos",
    "id": 900003,
    "url": "https://api.sofascore.app/api/v1/player/900003/heatmap/overall",
    "file": "assets/heatmaps/900003.png"
  },
  {
    "player": "Chris Führich",
    "id": 891510,
    "url": "https://api.sofascore.app/api/v1/player/891510/heatmap/overall",
    "file": "assets/heatmaps/891510.png"
  },
  {
    "player": "Joel Fujita",
    "id": 1002461,
    "url": "https://api.sofascore.app/api/v1/player/1002461/heatmap/overall",
    "file": "assets/heatmaps/1002461.png"
  },
  {
    "player": "Niclas Füllkrug",
    "id": 132645,
    "url": "https://api.sofascore.app/api/v1/player/132645/heatmap/overall",
    "file": "assets/heatmaps/132645.png"
  },
  {
    "player": "Matteo Gabbia",
    "id": 826195,
    "url": "https://api.sofascore.app/api/v1/player/826195/heatmap/overall",
    "file": "assets/heatmaps/826195.png"
  },
  {
    "player": "Tiago Gabriel",
    "id": 1651825,
    "url": "https://api.sofascore.app/api/v1/player/1651825/heatmap/overall",
    "file": "assets/heatmaps/1651825.png"
  },
  {
    "player": "Gianluca Gaetano",
    "id": 902019,
    "url": "https://api.sofascore.app/api/v1/player/902019/heatmap/overall",
    "file": "assets/heatmaps/902019.png"
  },
  {
    "player": "Roberto Gagliardini",
    "id": 287057,
    "url": "https://api.sofascore.app/api/v1/player/287057/heatmap/overall",
    "file": "assets/heatmaps/287057.png"
  },
  {
    "player": "Cody Gakpo",
    "id": 862967,
    "url": "https://api.sofascore.app/api/v1/player/862967/heatmap/overall",
    "file": "assets/heatmaps/862967.png"
  },
  {
    "player": "Iñigo Ruiz de Galarreta",
    "id": 96365,
    "url": "https://api.sofascore.app/api/v1/player/96365/heatmap/overall",
    "file": "assets/heatmaps/96365.png"
  },
  {
    "player": "Antonino Gallo",
    "id": 945616,
    "url": "https://api.sofascore.app/api/v1/player/945616/heatmap/overall",
    "file": "assets/heatmaps/945616.png"
  },
  {
    "player": "Idrissa Gana Gueye",
    "id": 106337,
    "url": "https://api.sofascore.app/api/v1/player/106337/heatmap/overall",
    "file": "assets/heatmaps/106337.png"
  },
  {
    "player": "Ignatius Ganago",
    "id": 890329,
    "url": "https://api.sofascore.app/api/v1/player/890329/heatmap/overall",
    "file": "assets/heatmaps/890329.png"
  },
  {
    "player": "Omri Gandelman",
    "id": 1019125,
    "url": "https://api.sofascore.app/api/v1/player/1019125/heatmap/overall",
    "file": "assets/heatmaps/1019125.png"
  },
  {
    "player": "Ismaëlo Ganiou",
    "id": 1408080,
    "url": "https://api.sofascore.app/api/v1/player/1408080/heatmap/overall",
    "file": "assets/heatmaps/1408080.png"
  },
  {
    "player": "Ben Gannon-Doak",
    "id": 1154861,
    "url": "https://api.sofascore.app/api/v1/player/1154861/heatmap/overall",
    "file": "assets/heatmaps/1154861.png"
  },
  {
    "player": "Facundo Garcés",
    "id": 879875,
    "url": "https://api.sofascore.app/api/v1/player/879875/heatmap/overall",
    "file": "assets/heatmaps/879875.png"
  },
  {
    "player": "Aleix García",
    "id": 796047,
    "url": "https://api.sofascore.app/api/v1/player/796047/heatmap/overall",
    "file": "assets/heatmaps/796047.png"
  },
  {
    "player": "Álvaro García",
    "id": 345111,
    "url": "https://api.sofascore.app/api/v1/player/345111/heatmap/overall",
    "file": "assets/heatmaps/345111.png"
  },
  {
    "player": "Andrés García",
    "id": 1457536,
    "url": "https://api.sofascore.app/api/v1/player/1457536/heatmap/overall",
    "file": "assets/heatmaps/1457536.png"
  },
  {
    "player": "Eder García",
    "id": 1425060,
    "url": "https://api.sofascore.app/api/v1/player/1425060/heatmap/overall",
    "file": "assets/heatmaps/1425060.png"
  },
  {
    "player": "Eric García",
    "id": 876214,
    "url": "https://api.sofascore.app/api/v1/player/876214/heatmap/overall",
    "file": "assets/heatmaps/876214.png"
  },
  {
    "player": "Fran Garcia",
    "id": 851271,
    "url": "https://api.sofascore.app/api/v1/player/851271/heatmap/overall",
    "file": "assets/heatmaps/851271.png"
  },
  {
    "player": "Gonzalo García",
    "id": 1402716,
    "url": "https://api.sofascore.app/api/v1/player/1402716/heatmap/overall",
    "file": "assets/heatmaps/1402716.png"
  },
  {
    "player": "Joan García",
    "id": 930267,
    "url": "https://api.sofascore.app/api/v1/player/930267/heatmap/overall",
    "file": "assets/heatmaps/930267.png"
  },
  {
    "player": "Pablo Garcia",
    "id": 1893910,
    "url": "https://api.sofascore.app/api/v1/player/1893910/heatmap/overall",
    "file": "assets/heatmaps/1893910.png"
  },
  {
    "player": "Rubén García",
    "id": 260031,
    "url": "https://api.sofascore.app/api/v1/player/260031/heatmap/overall",
    "file": "assets/heatmaps/260031.png"
  },
  {
    "player": "Ulisses Garcia",
    "id": 558320,
    "url": "https://api.sofascore.app/api/v1/player/558320/heatmap/overall",
    "file": "assets/heatmaps/558320.png"
  },
  {
    "player": "Víctor García",
    "id": 952222,
    "url": "https://api.sofascore.app/api/v1/player/952222/heatmap/overall",
    "file": "assets/heatmaps/952222.png"
  },
  {
    "player": "Alejandro Garnacho",
    "id": 1135873,
    "url": "https://api.sofascore.app/api/v1/player/1135873/heatmap/overall",
    "file": "assets/heatmaps/1135873.png"
  },
  {
    "player": "James Garner",
    "id": 927361,
    "url": "https://api.sofascore.app/api/v1/player/927361/heatmap/overall",
    "file": "assets/heatmaps/927361.png"
  },
  {
    "player": "Erawan Garnier",
    "id": 1842137,
    "url": "https://api.sofascore.app/api/v1/player/1842137/heatmap/overall",
    "file": "assets/heatmaps/1842137.png"
  },
  {
    "player": "Federico Gatti",
    "id": 1128063,
    "url": "https://api.sofascore.app/api/v1/player/1128063/heatmap/overall",
    "file": "assets/heatmaps/1128063.png"
  },
  {
    "player": "Federico Gattoni",
    "id": 941464,
    "url": "https://api.sofascore.app/api/v1/player/941464/heatmap/overall",
    "file": "assets/heatmaps/941464.png"
  },
  {
    "player": "Gavi",
    "id": 1103693,
    "url": "https://api.sofascore.app/api/v1/player/1103693/heatmap/overall",
    "file": "assets/heatmaps/1103693.png"
  },
  {
    "player": "Paulo Gazzaniga",
    "id": 164343,
    "url": "https://api.sofascore.app/api/v1/player/164343/heatmap/overall",
    "file": "assets/heatmaps/164343.png"
  },
  {
    "player": "Jean-Philippe Gbamin",
    "id": 326343,
    "url": "https://api.sofascore.app/api/v1/player/326343/heatmap/overall",
    "file": "assets/heatmaps/326343.png"
  },
  {
    "player": "Yann Gboho",
    "id": 911851,
    "url": "https://api.sofascore.app/api/v1/player/911851/heatmap/overall",
    "file": "assets/heatmaps/911851.png"
  },
  {
    "player": "David de Gea",
    "id": 69378,
    "url": "https://api.sofascore.app/api/v1/player/69378/heatmap/overall",
    "file": "assets/heatmaps/69378.png"
  },
  {
    "player": "Lutsharel Geertruida",
    "id": 856739,
    "url": "https://api.sofascore.app/api/v1/player/856739/heatmap/overall",
    "file": "assets/heatmaps/856739.png"
  },
  {
    "player": "Tyrique George",
    "id": 1403061,
    "url": "https://api.sofascore.app/api/v1/player/1403061/heatmap/overall",
    "file": "assets/heatmaps/1403061.png"
  },
  {
    "player": "Yannick Gerhardt",
    "id": 169255,
    "url": "https://api.sofascore.app/api/v1/player/169255/heatmap/overall",
    "file": "assets/heatmaps/169255.png"
  },
  {
    "player": "Ismaël Gharbi",
    "id": 1113488,
    "url": "https://api.sofascore.app/api/v1/player/1113488/heatmap/overall",
    "file": "assets/heatmaps/1113488.png"
  },
  {
    "player": "Rachid Ghezzal",
    "id": 123228,
    "url": "https://api.sofascore.app/api/v1/player/123228/heatmap/overall",
    "file": "assets/heatmaps/123228.png"
  },
  {
    "player": "Daniele Ghilardi",
    "id": 1384847,
    "url": "https://api.sofascore.app/api/v1/player/1384847/heatmap/overall",
    "file": "assets/heatmaps/1384847.png"
  },
  {
    "player": "Dimitris Giannoulis",
    "id": 354878,
    "url": "https://api.sofascore.app/api/v1/player/354878/heatmap/overall",
    "file": "assets/heatmaps/354878.png"
  },
  {
    "player": "Morgan Gibbs-White",
    "id": 865912,
    "url": "https://api.sofascore.app/api/v1/player/865912/heatmap/overall",
    "file": "assets/heatmaps/865912.png"
  },
  {
    "player": "Bryan Gil",
    "id": 910026,
    "url": "https://api.sofascore.app/api/v1/player/910026/heatmap/overall",
    "file": "assets/heatmaps/910026.png"
  },
  {
    "player": "Mario Gila",
    "id": 965828,
    "url": "https://api.sofascore.app/api/v1/player/965828/heatmap/overall",
    "file": "assets/heatmaps/965828.png"
  },
  {
    "player": "Billy Gilmour",
    "id": 907668,
    "url": "https://api.sofascore.app/api/v1/player/907668/heatmap/overall",
    "file": "assets/heatmaps/907668.png"
  },
  {
    "player": "Benedikt Gimber",
    "id": 798936,
    "url": "https://api.sofascore.app/api/v1/player/798936/heatmap/overall",
    "file": "assets/heatmaps/798936.png"
  },
  {
    "player": "Santiago Giménez",
    "id": 892141,
    "url": "https://api.sofascore.app/api/v1/player/892141/heatmap/overall",
    "file": "assets/heatmaps/892141.png"
  },
  {
    "player": "Gvidas Gineitis",
    "id": 1030829,
    "url": "https://api.sofascore.app/api/v1/player/1030829/heatmap/overall",
    "file": "assets/heatmaps/1030829.png"
  },
  {
    "player": "Matthias Ginter",
    "id": 142259,
    "url": "https://api.sofascore.app/api/v1/player/142259/heatmap/overall",
    "file": "assets/heatmaps/142259.png"
  },
  {
    "player": "Giovane",
    "id": 1170773,
    "url": "https://api.sofascore.app/api/v1/player/1170773/heatmap/overall",
    "file": "assets/heatmaps/1170773.png"
  },
  {
    "player": "Olivier Giroud",
    "id": 39070,
    "url": "https://api.sofascore.app/api/v1/player/39070/heatmap/overall",
    "file": "assets/heatmaps/39070.png"
  },
  {
    "player": "Jamie Gittens",
    "id": 1140599,
    "url": "https://api.sofascore.app/api/v1/player/1140599/heatmap/overall",
    "file": "assets/heatmaps/1140599.png"
  },
  {
    "player": "Robert Glatzel",
    "id": 168987,
    "url": "https://api.sofascore.app/api/v1/player/168987/heatmap/overall",
    "file": "assets/heatmaps/168987.png"
  },
  {
    "player": "Serge Gnabry",
    "id": 187433,
    "url": "https://api.sofascore.app/api/v1/player/187433/heatmap/overall",
    "file": "assets/heatmaps/187433.png"
  },
  {
    "player": "Wilfried Gnonto",
    "id": 998951,
    "url": "https://api.sofascore.app/api/v1/player/998951/heatmap/overall",
    "file": "assets/heatmaps/998951.png"
  },
  {
    "player": "Giorgi Gocholeishvili",
    "id": 1035752,
    "url": "https://api.sofascore.app/api/v1/player/1035752/heatmap/overall",
    "file": "assets/heatmaps/1035752.png"
  },
  {
    "player": "Martial Godo",
    "id": 1190938,
    "url": "https://api.sofascore.app/api/v1/player/1190938/heatmap/overall",
    "file": "assets/heatmaps/1190938.png"
  },
  {
    "player": "Maxima Goffi",
    "id": 1937040,
    "url": "https://api.sofascore.app/api/v1/player/1937040/heatmap/overall",
    "file": "assets/heatmaps/1937040.png"
  },
  {
    "player": "Edoardo Goldaniga",
    "id": 295133,
    "url": "https://api.sofascore.app/api/v1/player/295133/heatmap/overall",
    "file": "assets/heatmaps/295133.png"
  },
  {
    "player": "Aleksandr Golovin",
    "id": 318963,
    "url": "https://api.sofascore.app/api/v1/player/318963/heatmap/overall",
    "file": "assets/heatmaps/318963.png"
  },
  {
    "player": "Angel Gomes",
    "id": 867441,
    "url": "https://api.sofascore.app/api/v1/player/867441/heatmap/overall",
    "file": "assets/heatmaps/867441.png"
  },
  {
    "player": "João Gomes",
    "id": 1015267,
    "url": "https://api.sofascore.app/api/v1/player/1015267/heatmap/overall",
    "file": "assets/heatmaps/1015267.png"
  },
  {
    "player": "Rodrigo Gomes",
    "id": 1006073,
    "url": "https://api.sofascore.app/api/v1/player/1006073/heatmap/overall",
    "file": "assets/heatmaps/1006073.png"
  },
  {
    "player": "Toti Gomes",
    "id": 973418,
    "url": "https://api.sofascore.app/api/v1/player/973418/heatmap/overall",
    "file": "assets/heatmaps/973418.png"
  },
  {
    "player": "Diego Gómez",
    "id": 1065588,
    "url": "https://api.sofascore.app/api/v1/player/1065588/heatmap/overall",
    "file": "assets/heatmaps/1065588.png"
  },
  {
    "player": "Joe Gomez",
    "id": 318927,
    "url": "https://api.sofascore.app/api/v1/player/318927/heatmap/overall",
    "file": "assets/heatmaps/318927.png"
  },
  {
    "player": "Moi Gómez",
    "id": 149370,
    "url": "https://api.sofascore.app/api/v1/player/149370/heatmap/overall",
    "file": "assets/heatmaps/149370.png"
  },
  {
    "player": "Sergio Gómez",
    "id": 855835,
    "url": "https://api.sofascore.app/api/v1/player/855835/heatmap/overall",
    "file": "assets/heatmaps/855835.png"
  },
  {
    "player": "Unai Gómez",
    "id": 1391375,
    "url": "https://api.sofascore.app/api/v1/player/1391375/heatmap/overall",
    "file": "assets/heatmaps/1391375.png"
  },
  {
    "player": "Valentín Gómez",
    "id": 1186010,
    "url": "https://api.sofascore.app/api/v1/player/1186010/heatmap/overall",
    "file": "assets/heatmaps/1186010.png"
  },
  {
    "player": "Tidiam Gomis",
    "id": 1426577,
    "url": "https://api.sofascore.app/api/v1/player/1426577/heatmap/overall",
    "file": "assets/heatmaps/1426577.png"
  },
  {
    "player": "Anthony Gordon",
    "id": 914902,
    "url": "https://api.sofascore.app/api/v1/player/914902/heatmap/overall",
    "file": "assets/heatmaps/914902.png"
  },
  {
    "player": "Leon Goretzka",
    "id": 184661,
    "url": "https://api.sofascore.app/api/v1/player/184661/heatmap/overall",
    "file": "assets/heatmaps/184661.png"
  },
  {
    "player": "Andoni Gorosabel",
    "id": 866810,
    "url": "https://api.sofascore.app/api/v1/player/866810/heatmap/overall",
    "file": "assets/heatmaps/866810.png"
  },
  {
    "player": "Jon Gorrotxategi",
    "id": 1216309,
    "url": "https://api.sofascore.app/api/v1/player/1216309/heatmap/overall",
    "file": "assets/heatmaps/1216309.png"
  },
  {
    "player": "Olaf Gorter",
    "id": 1403088,
    "url": "https://api.sofascore.app/api/v1/player/1403088/heatmap/overall",
    "file": "assets/heatmaps/1403088.png"
  },
  {
    "player": "Robin Gosens",
    "id": 377118,
    "url": "https://api.sofascore.app/api/v1/player/377118/heatmap/overall",
    "file": "assets/heatmaps/377118.png"
  },
  {
    "player": "Mario Götze",
    "id": 66518,
    "url": "https://api.sofascore.app/api/v1/player/66518/heatmap/overall",
    "file": "assets/heatmaps/66518.png"
  },
  {
    "player": "Amine Gouiri",
    "id": 859026,
    "url": "https://api.sofascore.app/api/v1/player/859026/heatmap/overall",
    "file": "assets/heatmaps/859026.png"
  },
  {
    "player": "Lucas Gourna-Douath",
    "id": 1012657,
    "url": "https://api.sofascore.app/api/v1/player/1012657/heatmap/overall",
    "file": "assets/heatmaps/1012657.png"
  },
  {
    "player": "Tiago Gouveia",
    "id": 976410,
    "url": "https://api.sofascore.app/api/v1/player/976410/heatmap/overall",
    "file": "assets/heatmaps/976410.png"
  },
  {
    "player": "Jeffrey Gouweleeuw",
    "id": 146853,
    "url": "https://api.sofascore.app/api/v1/player/146853/heatmap/overall",
    "file": "assets/heatmaps/146853.png"
  },
  {
    "player": "Kamil Grabara",
    "id": 902080,
    "url": "https://api.sofascore.app/api/v1/player/902080/heatmap/overall",
    "file": "assets/heatmaps/902080.png"
  },
  {
    "player": "Jonathan Gradit",
    "id": 369650,
    "url": "https://api.sofascore.app/api/v1/player/369650/heatmap/overall",
    "file": "assets/heatmaps/369650.png"
  },
  {
    "player": "Alberto Grassi",
    "id": 186845,
    "url": "https://api.sofascore.app/api/v1/player/186845/heatmap/overall",
    "file": "assets/heatmaps/186845.png"
  },
  {
    "player": "Ryan Gravenberch",
    "id": 904897,
    "url": "https://api.sofascore.app/api/v1/player/904897/heatmap/overall",
    "file": "assets/heatmaps/904897.png"
  },
  {
    "player": "Archie Gray",
    "id": 1142335,
    "url": "https://api.sofascore.app/api/v1/player/1142335/heatmap/overall",
    "file": "assets/heatmaps/1142335.png"
  },
  {
    "player": "Jack Grealish",
    "id": 189061,
    "url": "https://api.sofascore.app/api/v1/player/189061/heatmap/overall",
    "file": "assets/heatmaps/189061.png"
  },
  {
    "player": "Mason Greenwood",
    "id": 942116,
    "url": "https://api.sofascore.app/api/v1/player/942116/heatmap/overall",
    "file": "assets/heatmaps/942116.png"
  },
  {
    "player": "Michael Gregoritsch",
    "id": 111483,
    "url": "https://api.sofascore.app/api/v1/player/111483/heatmap/overall",
    "file": "assets/heatmaps/111483.png"
  },
  {
    "player": "Dominik Greif",
    "id": 791046,
    "url": "https://api.sofascore.app/api/v1/player/791046/heatmap/overall",
    "file": "assets/heatmaps/791046.png"
  },
  {
    "player": "Antoine Griezmann",
    "id": 85859,
    "url": "https://api.sofascore.app/api/v1/player/85859/heatmap/overall",
    "file": "assets/heatmaps/85859.png"
  },
  {
    "player": "Vincenzo Grifo",
    "id": 171961,
    "url": "https://api.sofascore.app/api/v1/player/171961/heatmap/overall",
    "file": "assets/heatmaps/171961.png"
  },
  {
    "player": "Pascal Groß",
    "id": 48480,
    "url": "https://api.sofascore.app/api/v1/player/48480/heatmap/overall",
    "file": "assets/heatmaps/48480.png"
  },
  {
    "player": "Ilia Gruev",
    "id": 911679,
    "url": "https://api.sofascore.app/api/v1/player/911679/heatmap/overall",
    "file": "assets/heatmaps/911679.png"
  },
  {
    "player": "Marco Grüll",
    "id": 815612,
    "url": "https://api.sofascore.app/api/v1/player/815612/heatmap/overall",
    "file": "assets/heatmaps/815612.png"
  },
  {
    "player": "Nemanja Gudelj",
    "id": 68332,
    "url": "https://api.sofascore.app/api/v1/player/68332/heatmap/overall",
    "file": "assets/heatmaps/68332.png"
  },
  {
    "player": "Gabriel Gudmundsson",
    "id": 834308,
    "url": "https://api.sofascore.app/api/v1/player/834308/heatmap/overall",
    "file": "assets/heatmaps/834308.png"
  },
  {
    "player": "Gonçalo Guedes",
    "id": 280979,
    "url": "https://api.sofascore.app/api/v1/player/280979/heatmap/overall",
    "file": "assets/heatmaps/280979.png"
  },
  {
    "player": "Marc Guéhi",
    "id": 877994,
    "url": "https://api.sofascore.app/api/v1/player/877994/heatmap/overall",
    "file": "assets/heatmaps/877994.png"
  },
  {
    "player": "Javier Guerra",
    "id": 1122610,
    "url": "https://api.sofascore.app/api/v1/player/1122610/heatmap/overall",
    "file": "assets/heatmaps/1122610.png"
  },
  {
    "player": "Raphaël Guerreiro",
    "id": 246999,
    "url": "https://api.sofascore.app/api/v1/player/246999/heatmap/overall",
    "file": "assets/heatmaps/246999.png"
  },
  {
    "player": "Ismaël Guerti",
    "id": 1928232,
    "url": "https://api.sofascore.app/api/v1/player/1928232/heatmap/overall",
    "file": "assets/heatmaps/1928232.png"
  },
  {
    "player": "Ander Guevara",
    "id": 891931,
    "url": "https://api.sofascore.app/api/v1/player/891931/heatmap/overall",
    "file": "assets/heatmaps/891931.png"
  },
  {
    "player": "Pape Gueye",
    "id": 879694,
    "url": "https://api.sofascore.app/api/v1/player/879694/heatmap/overall",
    "file": "assets/heatmaps/879694.png"
  },
  {
    "player": "Frederic Guilbert",
    "id": 372430,
    "url": "https://api.sofascore.app/api/v1/player/372430/heatmap/overall",
    "file": "assets/heatmaps/372430.png"
  },
  {
    "player": "Bruno Guimarães",
    "id": 866469,
    "url": "https://api.sofascore.app/api/v1/player/866469/heatmap/overall",
    "file": "assets/heatmaps/866469.png"
  },
  {
    "player": "Daouda Guindo",
    "id": 1135887,
    "url": "https://api.sofascore.app/api/v1/player/1135887/heatmap/overall",
    "file": "assets/heatmaps/1135887.png"
  },
  {
    "player": "Bahereba Guirassy",
    "id": 1406007,
    "url": "https://api.sofascore.app/api/v1/player/1406007/heatmap/overall",
    "file": "assets/heatmaps/1406007.png"
  },
  {
    "player": "Serhou Guirassy",
    "id": 328027,
    "url": "https://api.sofascore.app/api/v1/player/328027/heatmap/overall",
    "file": "assets/heatmaps/328027.png"
  },
  {
    "player": "Marc Guiu",
    "id": 1414933,
    "url": "https://api.sofascore.app/api/v1/player/1414933/heatmap/overall",
    "file": "assets/heatmaps/1414933.png"
  },
  {
    "player": "Péter Gulácsi",
    "id": 37096,
    "url": "https://api.sofascore.app/api/v1/player/37096/heatmap/overall",
    "file": "assets/heatmaps/37096.png"
  },
  {
    "player": "Arda Güler",
    "id": 1091116,
    "url": "https://api.sofascore.app/api/v1/player/1091116/heatmap/overall",
    "file": "assets/heatmaps/1091116.png"
  },
  {
    "player": "Gerard Gumbau",
    "id": 326471,
    "url": "https://api.sofascore.app/api/v1/player/326471/heatmap/overall",
    "file": "assets/heatmaps/326471.png"
  },
  {
    "player": "Angus Gunn",
    "id": 227946,
    "url": "https://api.sofascore.app/api/v1/player/227946/heatmap/overall",
    "file": "assets/heatmaps/227946.png"
  },
  {
    "player": "Christian Günter",
    "id": 142231,
    "url": "https://api.sofascore.app/api/v1/player/142231/heatmap/overall",
    "file": "assets/heatmaps/142231.png"
  },
  {
    "player": "Jon Guridi",
    "id": 788141,
    "url": "https://api.sofascore.app/api/v1/player/788141/heatmap/overall",
    "file": "assets/heatmaps/788141.png"
  },
  {
    "player": "Gorka Guruzeta",
    "id": 605672,
    "url": "https://api.sofascore.app/api/v1/player/605672/heatmap/overall",
    "file": "assets/heatmaps/605672.png"
  },
  {
    "player": "Malo Gusto",
    "id": 996958,
    "url": "https://api.sofascore.app/api/v1/player/996958/heatmap/overall",
    "file": "assets/heatmaps/996958.png"
  },
  {
    "player": "Miguel Gutiérrez",
    "id": 908716,
    "url": "https://api.sofascore.app/api/v1/player/908716/heatmap/overall",
    "file": "assets/heatmaps/908716.png"
  },
  {
    "player": "Albert Guðmundsson",
    "id": 804909,
    "url": "https://api.sofascore.app/api/v1/player/804909/heatmap/overall",
    "file": "assets/heatmaps/804909.png"
  },
  {
    "player": "Joško Gvardiol",
    "id": 964994,
    "url": "https://api.sofascore.app/api/v1/player/964994/heatmap/overall",
    "file": "assets/heatmaps/964994.png"
  },
  {
    "player": "Viktor Gyökeres",
    "id": 804508,
    "url": "https://api.sofascore.app/api/v1/player/804508/heatmap/overall",
    "file": "assets/heatmaps/804508.png"
  },
  {
    "player": "Erling Haaland",
    "id": 839956,
    "url": "https://api.sofascore.app/api/v1/player/839956/heatmap/overall",
    "file": "assets/heatmaps/839956.png"
  },
  {
    "player": "Janik Haberer",
    "id": 168985,
    "url": "https://api.sofascore.app/api/v1/player/168985/heatmap/overall",
    "file": "assets/heatmaps/168985.png"
  },
  {
    "player": "Robin Hack",
    "id": 876858,
    "url": "https://api.sofascore.app/api/v1/player/876858/heatmap/overall",
    "file": "assets/heatmaps/876858.png"
  },
  {
    "player": "Amadou Haidara",
    "id": 822708,
    "url": "https://api.sofascore.app/api/v1/player/822708/heatmap/overall",
    "file": "assets/heatmaps/822708.png"
  },
  {
    "player": "Albian Hajdari",
    "id": 1000269,
    "url": "https://api.sofascore.app/api/v1/player/1000269/heatmap/overall",
    "file": "assets/heatmaps/1000269.png"
  },
  {
    "player": "Achraf Hakimi",
    "id": 814594,
    "url": "https://api.sofascore.app/api/v1/player/814594/heatmap/overall",
    "file": "assets/heatmaps/814594.png"
  },
  {
    "player": "Lewis Hall",
    "id": 1136730,
    "url": "https://api.sofascore.app/api/v1/player/1136730/heatmap/overall",
    "file": "assets/heatmaps/1136730.png"
  },
  {
    "player": "Adil Hamdani",
    "id": 2369898,
    "url": "https://api.sofascore.app/api/v1/player/2369898/heatmap/overall",
    "file": "assets/heatmaps/2369898.png"
  },
  {
    "player": "Andreas Hanche-Olsen",
    "id": 794294,
    "url": "https://api.sofascore.app/api/v1/player/794294/heatmap/overall",
    "file": "assets/heatmaps/794294.png"
  },
  {
    "player": "Dávid Hancko",
    "id": 807771,
    "url": "https://api.sofascore.app/api/v1/player/807771/heatmap/overall",
    "file": "assets/heatmaps/807771.png"
  },
  {
    "player": "Florent Hanin",
    "id": 170129,
    "url": "https://api.sofascore.app/api/v1/player/170129/heatmap/overall",
    "file": "assets/heatmaps/170129.png"
  },
  {
    "player": "Taichi Hara",
    "id": 925790,
    "url": "https://api.sofascore.app/api/v1/player/925790/heatmap/overall",
    "file": "assets/heatmaps/925790.png"
  },
  {
    "player": "Hákon Haraldsson",
    "id": 1138804,
    "url": "https://api.sofascore.app/api/v1/player/1138804/heatmap/overall",
    "file": "assets/heatmaps/1138804.png"
  },
  {
    "player": "Conrad Harder",
    "id": 1494826,
    "url": "https://api.sofascore.app/api/v1/player/1494826/heatmap/overall",
    "file": "assets/heatmaps/1494826.png"
  },
  {
    "player": "Abdou Harroui",
    "id": 915812,
    "url": "https://api.sofascore.app/api/v1/player/915812/heatmap/overall",
    "file": "assets/heatmaps/915812.png"
  },
  {
    "player": "Quilindschy Hartman",
    "id": 1392044,
    "url": "https://api.sofascore.app/api/v1/player/1392044/heatmap/overall",
    "file": "assets/heatmaps/1392044.png"
  },
  {
    "player": "Haissem Hassan",
    "id": 942836,
    "url": "https://api.sofascore.app/api/v1/player/942836/heatmap/overall",
    "file": "assets/heatmaps/942836.png"
  },
  {
    "player": "Hans Hateboer",
    "id": 356352,
    "url": "https://api.sofascore.app/api/v1/player/356352/heatmap/overall",
    "file": "assets/heatmaps/356352.png"
  },
  {
    "player": "Jorrel Hato",
    "id": 1153079,
    "url": "https://api.sofascore.app/api/v1/player/1153079/heatmap/overall",
    "file": "assets/heatmaps/1153079.png"
  },
  {
    "player": "Kjetil Haug",
    "id": 792318,
    "url": "https://api.sofascore.app/api/v1/player/792318/heatmap/overall",
    "file": "assets/heatmaps/792318.png"
  },
  {
    "player": "Kai Havertz",
    "id": 836705,
    "url": "https://api.sofascore.app/api/v1/player/836705/heatmap/overall",
    "file": "assets/heatmaps/836705.png"
  },
  {
    "player": "Ayden Heaven",
    "id": 1445799,
    "url": "https://api.sofascore.app/api/v1/player/1445799/heatmap/overall",
    "file": "assets/heatmaps/1445799.png"
  },
  {
    "player": "Jan Paul van Hecke",
    "id": 962012,
    "url": "https://api.sofascore.app/api/v1/player/962012/heatmap/overall",
    "file": "assets/heatmaps/962012.png"
  },
  {
    "player": "Hwang Hee-chan",
    "id": 786186,
    "url": "https://api.sofascore.app/api/v1/player/786186/heatmap/overall",
    "file": "assets/heatmaps/786186.png"
  },
  {
    "player": "Torbjørn Heggem",
    "id": 933264,
    "url": "https://api.sofascore.app/api/v1/player/933264/heatmap/overall",
    "file": "assets/heatmaps/933264.png"
  },
  {
    "player": "Gauthier Hein",
    "id": 842391,
    "url": "https://api.sofascore.app/api/v1/player/842391/heatmap/overall",
    "file": "assets/heatmaps/842391.png"
  },
  {
    "player": "Dominique Heintz",
    "id": 136922,
    "url": "https://api.sofascore.app/api/v1/player/136922/heatmap/overall",
    "file": "assets/heatmaps/136922.png"
  },
  {
    "player": "George Hemmings",
    "id": 1398204,
    "url": "https://api.sofascore.app/api/v1/player/1398204/heatmap/overall",
    "file": "assets/heatmaps/1398204.png"
  },
  {
    "player": "Dean Henderson",
    "id": 788134,
    "url": "https://api.sofascore.app/api/v1/player/788134/heatmap/overall",
    "file": "assets/heatmaps/788134.png"
  },
  {
    "player": "Jordan Henderson",
    "id": 42694,
    "url": "https://api.sofascore.app/api/v1/player/42694/heatmap/overall",
    "file": "assets/heatmaps/42694.png"
  },
  {
    "player": "Ramon Hendriks",
    "id": 916943,
    "url": "https://api.sofascore.app/api/v1/player/916943/heatmap/overall",
    "file": "assets/heatmaps/916943.png"
  },
  {
    "player": "Benjamin Henrichs",
    "id": 319857,
    "url": "https://api.sofascore.app/api/v1/player/319857/heatmap/overall",
    "file": "assets/heatmaps/319857.png"
  },
  {
    "player": "Luis Henrique",
    "id": 977679,
    "url": "https://api.sofascore.app/api/v1/player/977679/heatmap/overall",
    "file": "assets/heatmaps/977679.png"
  },
  {
    "player": "Rico Henry",
    "id": 599128,
    "url": "https://api.sofascore.app/api/v1/player/599128/heatmap/overall",
    "file": "assets/heatmaps/599128.png"
  },
  {
    "player": "Pharell Hensel",
    "id": 2114948,
    "url": "https://api.sofascore.app/api/v1/player/2114948/heatmap/overall",
    "file": "assets/heatmaps/2114948.png"
  },
  {
    "player": "Mads Hermansen",
    "id": 856640,
    "url": "https://api.sofascore.app/api/v1/player/856640/heatmap/overall",
    "file": "assets/heatmaps/856640.png"
  },
  {
    "player": "Mario Hermoso",
    "id": 353130,
    "url": "https://api.sofascore.app/api/v1/player/353130/heatmap/overall",
    "file": "assets/heatmaps/353130.png"
  },
  {
    "player": "Lucas Hernández",
    "id": 352370,
    "url": "https://api.sofascore.app/api/v1/player/352370/heatmap/overall",
    "file": "assets/heatmaps/352370.png"
  },
  {
    "player": "Jorge Herrando",
    "id": 944225,
    "url": "https://api.sofascore.app/api/v1/player/944225/heatmap/overall",
    "file": "assets/heatmaps/944225.png"
  },
  {
    "player": "Sergio Herrera",
    "id": 294377,
    "url": "https://api.sofascore.app/api/v1/player/294377/heatmap/overall",
    "file": "assets/heatmaps/294377.png"
  },
  {
    "player": "Yangel Herrera",
    "id": 839585,
    "url": "https://api.sofascore.app/api/v1/player/839585/heatmap/overall",
    "file": "assets/heatmaps/839585.png"
  },
  {
    "player": "Daniel Heuer Fernandes",
    "id": 113442,
    "url": "https://api.sofascore.app/api/v1/player/113442/heatmap/overall",
    "file": "assets/heatmaps/113442.png"
  },
  {
    "player": "Aaron Hickey",
    "id": 966869,
    "url": "https://api.sofascore.app/api/v1/player/966869/heatmap/overall",
    "file": "assets/heatmaps/966869.png"
  },
  {
    "player": "Santiago Hidalgo",
    "id": 1199247,
    "url": "https://api.sofascore.app/api/v1/player/1199247/heatmap/overall",
    "file": "assets/heatmaps/1199247.png"
  },
  {
    "player": "Isak Hien",
    "id": 1157713,
    "url": "https://api.sofascore.app/api/v1/player/1157713/heatmap/overall",
    "file": "assets/heatmaps/1157713.png"
  },
  {
    "player": "Asier Hierro",
    "id": 1550822,
    "url": "https://api.sofascore.app/api/v1/player/1550822/heatmap/overall",
    "file": "assets/heatmaps/1550822.png"
  },
  {
    "player": "James Hill",
    "id": 1156586,
    "url": "https://api.sofascore.app/api/v1/player/1156586/heatmap/overall",
    "file": "assets/heatmaps/1156586.png"
  },
  {
    "player": "Rémi Himbert",
    "id": 1961628,
    "url": "https://api.sofascore.app/api/v1/player/1961628/heatmap/overall",
    "file": "assets/heatmaps/1961628.png"
  },
  {
    "player": "Jack Hinshelwood",
    "id": 1142315,
    "url": "https://api.sofascore.app/api/v1/player/1142315/heatmap/overall",
    "file": "assets/heatmaps/1142315.png"
  },
  {
    "player": "Adam Hložek",
    "id": 963801,
    "url": "https://api.sofascore.app/api/v1/player/963801/heatmap/overall",
    "file": "assets/heatmaps/963801.png"
  },
  {
    "player": "Nicolas Höfler",
    "id": 49639,
    "url": "https://api.sofascore.app/api/v1/player/49639/heatmap/overall",
    "file": "assets/heatmaps/49639.png"
  },
  {
    "player": "Jonas Hofmann",
    "id": 142390,
    "url": "https://api.sofascore.app/api/v1/player/142390/heatmap/overall",
    "file": "assets/heatmaps/142390.png"
  },
  {
    "player": "Malthe Hojholt",
    "id": 997583,
    "url": "https://api.sofascore.app/api/v1/player/997583/heatmap/overall",
    "file": "assets/heatmaps/997583.png"
  },
  {
    "player": "Lucas Höler",
    "id": 280009,
    "url": "https://api.sofascore.app/api/v1/player/280009/heatmap/overall",
    "file": "assets/heatmaps/280009.png"
  },
  {
    "player": "Benedict Hollerbach",
    "id": 975800,
    "url": "https://api.sofascore.app/api/v1/player/975800/heatmap/overall",
    "file": "assets/heatmaps/975800.png"
  },
  {
    "player": "Emil Holm",
    "id": 965264,
    "url": "https://api.sofascore.app/api/v1/player/965264/heatmap/overall",
    "file": "assets/heatmaps/965264.png"
  },
  {
    "player": "Franck Honorat",
    "id": 280453,
    "url": "https://api.sofascore.app/api/v1/player/280453/heatmap/overall",
    "file": "assets/heatmaps/280453.png"
  },
  {
    "player": "Mathias Honsak",
    "id": 575952,
    "url": "https://api.sofascore.app/api/v1/player/575952/heatmap/overall",
    "file": "assets/heatmaps/575952.png"
  },
  {
    "player": "Andreas Hountondji",
    "id": 1112796,
    "url": "https://api.sofascore.app/api/v1/player/1112796/heatmap/overall",
    "file": "assets/heatmaps/1112796.png"
  },
  {
    "player": "Harry Howell",
    "id": 1627806,
    "url": "https://api.sofascore.app/api/v1/player/1627806/heatmap/overall",
    "file": "assets/heatmaps/1627806.png"
  },
  {
    "player": "Lukáš Hrádecký",
    "id": 15219,
    "url": "https://api.sofascore.app/api/v1/player/15219/heatmap/overall",
    "file": "assets/heatmaps/15219.png"
  },
  {
    "player": "Robin Hranáč",
    "id": 957615,
    "url": "https://api.sofascore.app/api/v1/player/957615/heatmap/overall",
    "file": "assets/heatmaps/957615.png"
  },
  {
    "player": "Timo Hübers",
    "id": 387220,
    "url": "https://api.sofascore.app/api/v1/player/387220/heatmap/overall",
    "file": "assets/heatmaps/387220.png"
  },
  {
    "player": "Callum Hudson-Odoi",
    "id": 867442,
    "url": "https://api.sofascore.app/api/v1/player/867442/heatmap/overall",
    "file": "assets/heatmaps/867442.png"
  },
  {
    "player": "Will Hughes",
    "id": 193554,
    "url": "https://api.sofascore.app/api/v1/player/193554/heatmap/overall",
    "file": "assets/heatmaps/193554.png"
  },
  {
    "player": "Dean Huijsen",
    "id": 1176744,
    "url": "https://api.sofascore.app/api/v1/player/1176744/heatmap/overall",
    "file": "assets/heatmaps/1176744.png"
  },
  {
    "player": "Trai Hume",
    "id": 989034,
    "url": "https://api.sofascore.app/api/v1/player/989034/heatmap/overall",
    "file": "assets/heatmaps/989034.png"
  },
  {
    "player": "Bashir Humphreys",
    "id": 996910,
    "url": "https://api.sofascore.app/api/v1/player/996910/heatmap/overall",
    "file": "assets/heatmaps/996910.png"
  },
  {
    "player": "Denis Huseinbasic",
    "id": 1064842,
    "url": "https://api.sofascore.app/api/v1/player/1064842/heatmap/overall",
    "file": "assets/heatmaps/1064842.png"
  },
  {
    "player": "Omari Hutchinson",
    "id": 1090963,
    "url": "https://api.sofascore.app/api/v1/player/1090963/heatmap/overall",
    "file": "assets/heatmaps/1090963.png"
  },
  {
    "player": "Elseid Hysaj",
    "id": 136322,
    "url": "https://api.sofascore.app/api/v1/player/136322/heatmap/overall",
    "file": "assets/heatmaps/136322.png"
  },
  {
    "player": "Lucas Høgsberg",
    "id": 1426597,
    "url": "https://api.sofascore.app/api/v1/player/1426597/heatmap/overall",
    "file": "assets/heatmaps/1426597.png"
  },
  {
    "player": "Oscar Højlund",
    "id": 1149113,
    "url": "https://api.sofascore.app/api/v1/player/1149113/heatmap/overall",
    "file": "assets/heatmaps/1149113.png"
  },
  {
    "player": "Rasmus Højlund",
    "id": 1086417,
    "url": "https://api.sofascore.app/api/v1/player/1086417/heatmap/overall",
    "file": "assets/heatmaps/1086417.png"
  },
  {
    "player": "Edoardo Iannoni",
    "id": 1013239,
    "url": "https://api.sofascore.app/api/v1/player/1013239/heatmap/overall",
    "file": "assets/heatmaps/1013239.png"
  },
  {
    "player": "Pablo Ibáñez",
    "id": 1084381,
    "url": "https://api.sofascore.app/api/v1/player/1084381/heatmap/overall",
    "file": "assets/heatmaps/1084381.png"
  },
  {
    "player": "Arijon Ibrahimović",
    "id": 1142248,
    "url": "https://api.sofascore.app/api/v1/player/1142248/heatmap/overall",
    "file": "assets/heatmaps/1142248.png"
  },
  {
    "player": "Riyad Idrissi",
    "id": 1123175,
    "url": "https://api.sofascore.app/api/v1/player/1123175/heatmap/overall",
    "file": "assets/heatmaps/1123175.png"
  },
  {
    "player": "Stanis Idumbo",
    "id": 1149152,
    "url": "https://api.sofascore.app/api/v1/player/1149152/heatmap/overall",
    "file": "assets/heatmaps/1149152.png"
  },
  {
    "player": "Jay Idzes",
    "id": 933641,
    "url": "https://api.sofascore.app/api/v1/player/933641/heatmap/overall",
    "file": "assets/heatmaps/933641.png"
  },
  {
    "player": "Hamza Igamane",
    "id": 1140859,
    "url": "https://api.sofascore.app/api/v1/player/1140859/heatmap/overall",
    "file": "assets/heatmaps/1140859.png"
  },
  {
    "player": "Iglesias",
    "id": 949707,
    "url": "https://api.sofascore.app/api/v1/player/949707/heatmap/overall",
    "file": "assets/heatmaps/949707.png"
  },
  {
    "player": "Borja Iglesias",
    "id": 785989,
    "url": "https://api.sofascore.app/api/v1/player/785989/heatmap/overall",
    "file": "assets/heatmaps/785989.png"
  },
  {
    "player": "Andrej Ilic",
    "id": 953767,
    "url": "https://api.sofascore.app/api/v1/player/953767/heatmap/overall",
    "file": "assets/heatmaps/953767.png"
  },
  {
    "player": "Ivan Ilić",
    "id": 877371,
    "url": "https://api.sofascore.app/api/v1/player/877371/heatmap/overall",
    "file": "assets/heatmaps/877371.png"
  },
  {
    "player": "Luka Ilić",
    "id": 885664,
    "url": "https://api.sofascore.app/api/v1/player/885664/heatmap/overall",
    "file": "assets/heatmaps/885664.png"
  },
  {
    "player": "Samuel Iling-Junior",
    "id": 996919,
    "url": "https://api.sofascore.app/api/v1/player/996919/heatmap/overall",
    "file": "assets/heatmaps/996919.png"
  },
  {
    "player": "Emirhan İlkhan",
    "id": 1142612,
    "url": "https://api.sofascore.app/api/v1/player/1142612/heatmap/overall",
    "file": "assets/heatmaps/1142612.png"
  },
  {
    "player": "Samuele Inácio",
    "id": 1861666,
    "url": "https://api.sofascore.app/api/v1/player/1861666/heatmap/overall",
    "file": "assets/heatmaps/1861666.png"
  },
  {
    "player": "Cyriaque Irié",
    "id": 1508537,
    "url": "https://api.sofascore.app/api/v1/player/1508537/heatmap/overall",
    "file": "assets/heatmaps/1508537.png"
  },
  {
    "player": "Tim Iroegbunam",
    "id": 1085950,
    "url": "https://api.sofascore.app/api/v1/player/1085950/heatmap/overall",
    "file": "assets/heatmaps/1085950.png"
  },
  {
    "player": "Jackson Irvine",
    "id": 181581,
    "url": "https://api.sofascore.app/api/v1/player/181581/heatmap/overall",
    "file": "assets/heatmaps/181581.png"
  },
  {
    "player": "Isaac",
    "id": 1471239,
    "url": "https://api.sofascore.app/api/v1/player/1471239/heatmap/overall",
    "file": "assets/heatmaps/1471239.png"
  },
  {
    "player": "Alexander Isak",
    "id": 823941,
    "url": "https://api.sofascore.app/api/v1/player/823941/heatmap/overall",
    "file": "assets/heatmaps/823941.png"
  },
  {
    "player": "Gustav Isaksen",
    "id": 976381,
    "url": "https://api.sofascore.app/api/v1/player/976381/heatmap/overall",
    "file": "assets/heatmaps/976381.png"
  },
  {
    "player": "Isco",
    "id": 103417,
    "url": "https://api.sofascore.app/api/v1/player/103417/heatmap/overall",
    "file": "assets/heatmaps/103417.png"
  },
  {
    "player": "Wilson Isidor",
    "id": 877980,
    "url": "https://api.sofascore.app/api/v1/player/877980/heatmap/overall",
    "file": "assets/heatmaps/877980.png"
  },
  {
    "player": "Ardian Ismajli",
    "id": 840414,
    "url": "https://api.sofascore.app/api/v1/player/840414/heatmap/overall",
    "file": "assets/heatmaps/840414.png"
  },
  {
    "player": "Franco Israel",
    "id": 1084846,
    "url": "https://api.sofascore.app/api/v1/player/1084846/heatmap/overall",
    "file": "assets/heatmaps/1084846.png"
  },
  {
    "player": "Hiroki Ito",
    "id": 873106,
    "url": "https://api.sofascore.app/api/v1/player/873106/heatmap/overall",
    "file": "assets/heatmaps/873106.png"
  },
  {
    "player": "Alex Iwobi",
    "id": 352770,
    "url": "https://api.sofascore.app/api/v1/player/352770/heatmap/overall",
    "file": "assets/heatmaps/352770.png"
  },
  {
    "player": "Urko Izeta",
    "id": 1430667,
    "url": "https://api.sofascore.app/api/v1/player/1430667/heatmap/overall",
    "file": "assets/heatmaps/1430667.png"
  },
  {
    "player": "Nicolas Jackson",
    "id": 1085381,
    "url": "https://api.sofascore.app/api/v1/player/1085381/heatmap/overall",
    "file": "assets/heatmaps/1085381.png"
  },
  {
    "player": "Jérémy Jacquet",
    "id": 1445625,
    "url": "https://api.sofascore.app/api/v1/player/1445625/heatmap/overall",
    "file": "assets/heatmaps/1445625.png"
  },
  {
    "player": "Ricky Jade-Jones",
    "id": 994529,
    "url": "https://api.sofascore.app/api/v1/player/994529/heatmap/overall",
    "file": "assets/heatmaps/994529.png"
  },
  {
    "player": "Lee Jae-sung",
    "id": 537552,
    "url": "https://api.sofascore.app/api/v1/player/537552/heatmap/overall",
    "file": "assets/heatmaps/537552.png"
  },
  {
    "player": "Kristijan Jakić",
    "id": 796206,
    "url": "https://api.sofascore.app/api/v1/player/796206/heatmap/overall",
    "file": "assets/heatmaps/796206.png"
  },
  {
    "player": "Karl Jakob Hein",
    "id": 991591,
    "url": "https://api.sofascore.app/api/v1/player/991591/heatmap/overall",
    "file": "assets/heatmaps/991591.png"
  },
  {
    "player": "Daniel James",
    "id": 828639,
    "url": "https://api.sofascore.app/api/v1/player/828639/heatmap/overall",
    "file": "assets/heatmaps/828639.png"
  },
  {
    "player": "Reece James",
    "id": 885908,
    "url": "https://api.sofascore.app/api/v1/player/885908/heatmap/overall",
    "file": "assets/heatmaps/885908.png"
  },
  {
    "player": "Vitaly Janelt",
    "id": 814873,
    "url": "https://api.sofascore.app/api/v1/player/814873/heatmap/overall",
    "file": "assets/heatmaps/814873.png"
  },
  {
    "player": "Isak Jansson",
    "id": 962064,
    "url": "https://api.sofascore.app/api/v1/player/962064/heatmap/overall",
    "file": "assets/heatmaps/962064.png"
  },
  {
    "player": "Adnan Januzaj",
    "id": 328145,
    "url": "https://api.sofascore.app/api/v1/player/328145/heatmap/overall",
    "file": "assets/heatmaps/328145.png"
  },
  {
    "player": "Luca Jaquez",
    "id": 1127823,
    "url": "https://api.sofascore.app/api/v1/player/1127823/heatmap/overall",
    "file": "assets/heatmaps/1127823.png"
  },
  {
    "player": "Ardon Jashari",
    "id": 1034082,
    "url": "https://api.sofascore.app/api/v1/player/1034082/heatmap/overall",
    "file": "assets/heatmaps/1034082.png"
  },
  {
    "player": "Bakery Jatta",
    "id": 842526,
    "url": "https://api.sofascore.app/api/v1/player/842526/heatmap/overall",
    "file": "assets/heatmaps/842526.png"
  },
  {
    "player": "Mikel Jauregizar",
    "id": 1495844,
    "url": "https://api.sofascore.app/api/v1/player/1495844/heatmap/overall",
    "file": "assets/heatmaps/1495844.png"
  },
  {
    "player": "Gaby Jean",
    "id": 1392819,
    "url": "https://api.sofascore.app/api/v1/player/1392819/heatmap/overall",
    "file": "assets/heatmaps/1392819.png"
  },
  {
    "player": "Finn Jeltsch",
    "id": 1418649,
    "url": "https://api.sofascore.app/api/v1/player/1418649/heatmap/overall",
    "file": "assets/heatmaps/1418649.png"
  },
  {
    "player": "Castrop Jens",
    "id": 1019312,
    "url": "https://api.sofascore.app/api/v1/player/1019312/heatmap/overall",
    "file": "assets/heatmaps/1019312.png"
  },
  {
    "player": "Mathias Jensen",
    "id": 799251,
    "url": "https://api.sofascore.app/api/v1/player/799251/heatmap/overall",
    "file": "assets/heatmaps/799251.png"
  },
  {
    "player": "Moritz Jenz",
    "id": 920525,
    "url": "https://api.sofascore.app/api/v1/player/920525/heatmap/overall",
    "file": "assets/heatmaps/920525.png"
  },
  {
    "player": "Gabriel Jesus",
    "id": 794839,
    "url": "https://api.sofascore.app/api/v1/player/794839/heatmap/overall",
    "file": "assets/heatmaps/794839.png"
  },
  {
    "player": "Igor Jesus",
    "id": 981619,
    "url": "https://api.sofascore.app/api/v1/player/981619/heatmap/overall",
    "file": "assets/heatmaps/981619.png"
  },
  {
    "player": "Juan Jesus",
    "id": 108484,
    "url": "https://api.sofascore.app/api/v1/player/108484/heatmap/overall",
    "file": "assets/heatmaps/108484.png"
  },
  {
    "player": "David Jiménez",
    "id": 1142689,
    "url": "https://api.sofascore.app/api/v1/player/1142689/heatmap/overall",
    "file": "assets/heatmaps/1142689.png"
  },
  {
    "player": "Raúl Jiménez",
    "id": 192442,
    "url": "https://api.sofascore.app/api/v1/player/192442/heatmap/overall",
    "file": "assets/heatmaps/192442.png"
  },
  {
    "player": "João Pedro",
    "id": 975079,
    "url": "https://api.sofascore.app/api/v1/player/975079/heatmap/overall",
    "file": "assets/heatmaps/975079.png"
  },
  {
    "player": "Joelinton",
    "id": 560128,
    "url": "https://api.sofascore.app/api/v1/player/560128/heatmap/overall",
    "file": "assets/heatmaps/560128.png"
  },
  {
    "player": "Jofre",
    "id": 1019236,
    "url": "https://api.sofascore.app/api/v1/player/1019236/heatmap/overall",
    "file": "assets/heatmaps/1019236.png"
  },
  {
    "player": "Þórir Jóhann Helgason",
    "id": 886628,
    "url": "https://api.sofascore.app/api/v1/player/886628/heatmap/overall",
    "file": "assets/heatmaps/886628.png"
  },
  {
    "player": "Ísak Jóhannesson",
    "id": 1112327,
    "url": "https://api.sofascore.app/api/v1/player/1112327/heatmap/overall",
    "file": "assets/heatmaps/1112327.png"
  },
  {
    "player": "John",
    "id": 840103,
    "url": "https://api.sofascore.app/api/v1/player/840103/heatmap/overall",
    "file": "assets/heatmaps/840103.png"
  },
  {
    "player": "Brennan Johnson",
    "id": 1085180,
    "url": "https://api.sofascore.app/api/v1/player/1085180/heatmap/overall",
    "file": "assets/heatmaps/1085180.png"
  },
  {
    "player": "Karl-Johan Johnsson",
    "id": 40973,
    "url": "https://api.sofascore.app/api/v1/player/40973/heatmap/overall",
    "file": "assets/heatmaps/40973.png"
  },
  {
    "player": "Sam Johnstone",
    "id": 98427,
    "url": "https://api.sofascore.app/api/v1/player/98427/heatmap/overall",
    "file": "assets/heatmaps/98427.png"
  },
  {
    "player": "Curtis Jones",
    "id": 927353,
    "url": "https://api.sofascore.app/api/v1/player/927353/heatmap/overall",
    "file": "assets/heatmaps/927353.png"
  },
  {
    "player": "Frenkie de Jong",
    "id": 795222,
    "url": "https://api.sofascore.app/api/v1/player/795222/heatmap/overall",
    "file": "assets/heatmaps/795222.png"
  },
  {
    "player": "Joan Jordán",
    "id": 591750,
    "url": "https://api.sofascore.app/api/v1/player/591750/heatmap/overall",
    "file": "assets/heatmaps/591750.png"
  },
  {
    "player": "Josan",
    "id": 808955,
    "url": "https://api.sofascore.app/api/v1/player/808955/heatmap/overall",
    "file": "assets/heatmaps/808955.png"
  },
  {
    "player": "Mateo Joseph",
    "id": 1170693,
    "url": "https://api.sofascore.app/api/v1/player/1170693/heatmap/overall",
    "file": "assets/heatmaps/1170693.png"
  },
  {
    "player": "Lazar Jovanović",
    "id": 1427148,
    "url": "https://api.sofascore.app/api/v1/player/1427148/heatmap/overall",
    "file": "assets/heatmaps/1427148.png"
  },
  {
    "player": "Juanmi",
    "id": 96369,
    "url": "https://api.sofascore.app/api/v1/player/96369/heatmap/overall",
    "file": "assets/heatmaps/96369.png"
  },
  {
    "player": "Abdulai Juma Bah",
    "id": 1606792,
    "url": "https://api.sofascore.app/api/v1/player/1606792/heatmap/overall",
    "file": "assets/heatmaps/1606792.png"
  },
  {
    "player": "Anthony Jung",
    "id": 103442,
    "url": "https://api.sofascore.app/api/v1/player/103442/heatmap/overall",
    "file": "assets/heatmaps/103442.png"
  },
  {
    "player": "Eli Junior Kroupi",
    "id": 1426228,
    "url": "https://api.sofascore.app/api/v1/player/1426228/heatmap/overall",
    "file": "assets/heatmaps/1426228.png"
  },
  {
    "player": "Luiz Lúcio Reis Júnior",
    "id": 1066603,
    "url": "https://api.sofascore.app/api/v1/player/1066603/heatmap/overall",
    "file": "assets/heatmaps/1066603.png"
  },
  {
    "player": "Vinicius Júnior",
    "id": 868812,
    "url": "https://api.sofascore.app/api/v1/player/868812/heatmap/overall",
    "file": "assets/heatmaps/868812.png"
  },
  {
    "player": "Josip Juranović",
    "id": 791642,
    "url": "https://api.sofascore.app/api/v1/player/791642/heatmap/overall",
    "file": "assets/heatmaps/791642.png"
  },
  {
    "player": "James Justin",
    "id": 827681,
    "url": "https://api.sofascore.app/api/v1/player/827681/heatmap/overall",
    "file": "assets/heatmaps/827681.png"
  },
  {
    "player": "Ferran Jutglà",
    "id": 949962,
    "url": "https://api.sofascore.app/api/v1/player/949962/heatmap/overall",
    "file": "assets/heatmaps/949962.png"
  },
  {
    "player": "Filip Jørgensen",
    "id": 962053,
    "url": "https://api.sofascore.app/api/v1/player/962053/heatmap/overall",
    "file": "assets/heatmaps/962053.png"
  },
  {
    "player": "Martijn Kaars",
    "id": 861850,
    "url": "https://api.sofascore.app/api/v1/player/861850/heatmap/overall",
    "file": "assets/heatmaps/861850.png"
  },
  {
    "player": "Ozan Kabak",
    "id": 857740,
    "url": "https://api.sofascore.app/api/v1/player/857740/heatmap/overall",
    "file": "assets/heatmaps/857740.png"
  },
  {
    "player": "Christian Kabasele",
    "id": 58351,
    "url": "https://api.sofascore.app/api/v1/player/58351/heatmap/overall",
    "file": "assets/heatmaps/58351.png"
  },
  {
    "player": "Anton Kade",
    "id": 1129365,
    "url": "https://api.sofascore.app/api/v1/player/1129365/heatmap/overall",
    "file": "assets/heatmaps/1129365.png"
  },
  {
    "player": "Ferdi Kadioglu",
    "id": 825844,
    "url": "https://api.sofascore.app/api/v1/player/825844/heatmap/overall",
    "file": "assets/heatmaps/825844.png"
  },
  {
    "player": "Florian Kainz",
    "id": 78781,
    "url": "https://api.sofascore.app/api/v1/player/78781/heatmap/overall",
    "file": "assets/heatmaps/78781.png"
  },
  {
    "player": "Arnaud Kalimuendo",
    "id": 954061,
    "url": "https://api.sofascore.app/api/v1/player/954061/heatmap/overall",
    "file": "assets/heatmaps/954061.png"
  },
  {
    "player": "Pierre Kalulu",
    "id": 965330,
    "url": "https://api.sofascore.app/api/v1/player/965330/heatmap/overall",
    "file": "assets/heatmaps/965330.png"
  },
  {
    "player": "Daichi Kamada",
    "id": 794338,
    "url": "https://api.sofascore.app/api/v1/player/794338/heatmap/overall",
    "file": "assets/heatmaps/794338.png"
  },
  {
    "player": "Warren Kamanzi",
    "id": 1048366,
    "url": "https://api.sofascore.app/api/v1/player/1048366/heatmap/overall",
    "file": "assets/heatmaps/1048366.png"
  },
  {
    "player": "Abu Kamara",
    "id": 1087476,
    "url": "https://api.sofascore.app/api/v1/player/1087476/heatmap/overall",
    "file": "assets/heatmaps/1087476.png"
  },
  {
    "player": "Bingourou Kamara",
    "id": 583312,
    "url": "https://api.sofascore.app/api/v1/player/583312/heatmap/overall",
    "file": "assets/heatmaps/583312.png"
  },
  {
    "player": "Boubacar Kamara",
    "id": 826204,
    "url": "https://api.sofascore.app/api/v1/player/826204/heatmap/overall",
    "file": "assets/heatmaps/826204.png"
  },
  {
    "player": "Glen Kamara",
    "id": 292665,
    "url": "https://api.sofascore.app/api/v1/player/292665/heatmap/overall",
    "file": "assets/heatmaps/292665.png"
  },
  {
    "player": "Hassane Kamara",
    "id": 351434,
    "url": "https://api.sofascore.app/api/v1/player/351434/heatmap/overall",
    "file": "assets/heatmaps/351434.png"
  },
  {
    "player": "Noham Kamara",
    "id": 1937750,
    "url": "https://api.sofascore.app/api/v1/player/1937750/heatmap/overall",
    "file": "assets/heatmaps/1937750.png"
  },
  {
    "player": "Jakub Kamiński",
    "id": 801263,
    "url": "https://api.sofascore.app/api/v1/player/801263/heatmap/overall",
    "file": "assets/heatmaps/801263.png"
  },
  {
    "player": "Harry Kane",
    "id": 108579,
    "url": "https://api.sofascore.app/api/v1/player/108579/heatmap/overall",
    "file": "assets/heatmaps/108579.png"
  },
  {
    "player": "Lee Kang-in",
    "id": 917087,
    "url": "https://api.sofascore.app/api/v1/player/917087/heatmap/overall",
    "file": "assets/heatmaps/917087.png"
  },
  {
    "player": "Steeve Kango",
    "id": 1627804,
    "url": "https://api.sofascore.app/api/v1/player/1627804/heatmap/overall",
    "file": "assets/heatmaps/1627804.png"
  },
  {
    "player": "Mohamadou Kanté",
    "id": 1523623,
    "url": "https://api.sofascore.app/api/v1/player/1523623/heatmap/overall",
    "file": "assets/heatmaps/1523623.png"
  },
  {
    "player": "Adam Karabec",
    "id": 1000175,
    "url": "https://api.sofascore.app/api/v1/player/1000175/heatmap/overall",
    "file": "assets/heatmaps/1000175.png"
  },
  {
    "player": "Atakan Karazor",
    "id": 801030,
    "url": "https://api.sofascore.app/api/v1/player/801030/heatmap/overall",
    "file": "assets/heatmaps/801030.png"
  },
  {
    "player": "Dermane Karim",
    "id": 1130307,
    "url": "https://api.sofascore.app/api/v1/player/1130307/heatmap/overall",
    "file": "assets/heatmaps/1130307.png"
  },
  {
    "player": "Lennart Karl",
    "id": 1861975,
    "url": "https://api.sofascore.app/api/v1/player/1861975/heatmap/overall",
    "file": "assets/heatmaps/1861975.png"
  },
  {
    "player": "Jesper Karlström",
    "id": 227894,
    "url": "https://api.sofascore.app/api/v1/player/227894/heatmap/overall",
    "file": "assets/heatmaps/227894.png"
  },
  {
    "player": "Jon Karrikaburu",
    "id": 1099175,
    "url": "https://api.sofascore.app/api/v1/player/1099175/heatmap/overall",
    "file": "assets/heatmaps/1099175.png"
  },
  {
    "player": "Silas Katompa",
    "id": 949062,
    "url": "https://api.sofascore.app/api/v1/player/949062/heatmap/overall",
    "file": "assets/heatmaps/949062.png"
  },
  {
    "player": "Panos Katseris",
    "id": 1402217,
    "url": "https://api.sofascore.app/api/v1/player/1402217/heatmap/overall",
    "file": "assets/heatmaps/1402217.png"
  },
  {
    "player": "Mikkel Kaufmann",
    "id": 918437,
    "url": "https://api.sofascore.app/api/v1/player/918437/heatmap/overall",
    "file": "assets/heatmaps/918437.png"
  },
  {
    "player": "Sota Kawasaki",
    "id": 1028306,
    "url": "https://api.sofascore.app/api/v1/player/1028306/heatmap/overall",
    "file": "assets/heatmaps/1028306.png"
  },
  {
    "player": "Michael Kayode",
    "id": 1137431,
    "url": "https://api.sofascore.app/api/v1/player/1137431/heatmap/overall",
    "file": "assets/heatmaps/1137431.png"
  },
  {
    "player": "Moise Kean",
    "id": 835601,
    "url": "https://api.sofascore.app/api/v1/player/835601/heatmap/overall",
    "file": "assets/heatmaps/835601.png"
  },
  {
    "player": "Michael Keane",
    "id": 110846,
    "url": "https://api.sofascore.app/api/v1/player/110846/heatmap/overall",
    "file": "assets/heatmaps/110846.png"
  },
  {
    "player": "Yassine Kechta",
    "id": 1000442,
    "url": "https://api.sofascore.app/api/v1/player/1000442/heatmap/overall",
    "file": "assets/heatmaps/1000442.png"
  },
  {
    "player": "Thilo Kehrer",
    "id": 281277,
    "url": "https://api.sofascore.app/api/v1/player/281277/heatmap/overall",
    "file": "assets/heatmaps/281277.png"
  },
  {
    "player": "Mandela Keita",
    "id": 1110136,
    "url": "https://api.sofascore.app/api/v1/player/1110136/heatmap/overall",
    "file": "assets/heatmaps/1110136.png"
  },
  {
    "player": "Yannik Keitel",
    "id": 877842,
    "url": "https://api.sofascore.app/api/v1/player/877842/heatmap/overall",
    "file": "assets/heatmaps/877842.png"
  },
  {
    "player": "Caoimhín Kelleher",
    "id": 827362,
    "url": "https://api.sofascore.app/api/v1/player/827362/heatmap/overall",
    "file": "assets/heatmaps/827362.png"
  },
  {
    "player": "Lloyd Kelly",
    "id": 865167,
    "url": "https://api.sofascore.app/api/v1/player/865167/heatmap/overall",
    "file": "assets/heatmaps/865167.png"
  },
  {
    "player": "Aljoscha Kemlein",
    "id": 1198074,
    "url": "https://api.sofascore.app/api/v1/player/1198074/heatmap/overall",
    "file": "assets/heatmaps/1198074.png"
  },
  {
    "player": "Marc-Oliver Kempf",
    "id": 226974,
    "url": "https://api.sofascore.app/api/v1/player/226974/heatmap/overall",
    "file": "assets/heatmaps/226974.png"
  },
  {
    "player": "Luca Kerber",
    "id": 1097453,
    "url": "https://api.sofascore.app/api/v1/player/1097453/heatmap/overall",
    "file": "assets/heatmaps/1097453.png"
  },
  {
    "player": "Milos Kerkez",
    "id": 1097425,
    "url": "https://api.sofascore.app/api/v1/player/1097425/heatmap/overall",
    "file": "assets/heatmaps/1097425.png"
  },
  {
    "player": "Kevin",
    "id": 1112879,
    "url": "https://api.sofascore.app/api/v1/player/1112879/heatmap/overall",
    "file": "assets/heatmaps/1112879.png"
  },
  {
    "player": "Reda Khadra",
    "id": 995671,
    "url": "https://api.sofascore.app/api/v1/player/995671/heatmap/overall",
    "file": "assets/heatmaps/995671.png"
  },
  {
    "player": "Bilal El Khannouss",
    "id": 1126569,
    "url": "https://api.sofascore.app/api/v1/player/1126569/heatmap/overall",
    "file": "assets/heatmaps/1126569.png"
  },
  {
    "player": "Rani Khedira",
    "id": 149479,
    "url": "https://api.sofascore.app/api/v1/player/149479/heatmap/overall",
    "file": "assets/heatmaps/149479.png"
  },
  {
    "player": "Abdukodir Khusanov",
    "id": 1194333,
    "url": "https://api.sofascore.app/api/v1/player/1194333/heatmap/overall",
    "file": "assets/heatmaps/1194333.png"
  },
  {
    "player": "Cassiano Kiala",
    "id": 1994978,
    "url": "https://api.sofascore.app/api/v1/player/1994978/heatmap/overall",
    "file": "assets/heatmaps/1994978.png"
  },
  {
    "player": "Kialonda",
    "id": 1090374,
    "url": "https://api.sofascore.app/api/v1/player/1090374/heatmap/overall",
    "file": "assets/heatmaps/1090374.png"
  },
  {
    "player": "Kiké",
    "id": 84972,
    "url": "https://api.sofascore.app/api/v1/player/84972/heatmap/overall",
    "file": "assets/heatmaps/84972.png"
  },
  {
    "player": "Semih Kılıçsoy",
    "id": 1142606,
    "url": "https://api.sofascore.app/api/v1/player/1142606/heatmap/overall",
    "file": "assets/heatmaps/1142606.png"
  },
  {
    "player": "Max Kilman",
    "id": 894474,
    "url": "https://api.sofascore.app/api/v1/player/894474/heatmap/overall",
    "file": "assets/heatmaps/894474.png"
  },
  {
    "player": "Joshua Kimmich",
    "id": 259117,
    "url": "https://api.sofascore.app/api/v1/player/259117/heatmap/overall",
    "file": "assets/heatmaps/259117.png"
  },
  {
    "player": "Joshua King",
    "id": 1546231,
    "url": "https://api.sofascore.app/api/v1/player/1546231/heatmap/overall",
    "file": "assets/heatmaps/1546231.png"
  },
  {
    "player": "Tim Kleindienst",
    "id": 228981,
    "url": "https://api.sofascore.app/api/v1/player/228981/heatmap/overall",
    "file": "assets/heatmaps/228981.png"
  },
  {
    "player": "Lukas Klostermann",
    "id": 319853,
    "url": "https://api.sofascore.app/api/v1/player/319853/heatmap/overall",
    "file": "assets/heatmaps/319853.png"
  },
  {
    "player": "Justin Kluivert",
    "id": 851596,
    "url": "https://api.sofascore.app/api/v1/player/851596/heatmap/overall",
    "file": "assets/heatmaps/851596.png"
  },
  {
    "player": "Ruben Kluivert",
    "id": 1014540,
    "url": "https://api.sofascore.app/api/v1/player/1014540/heatmap/overall",
    "file": "assets/heatmaps/1014540.png"
  },
  {
    "player": "Ansgar Knauff",
    "id": 997012,
    "url": "https://api.sofascore.app/api/v1/player/997012/heatmap/overall",
    "file": "assets/heatmaps/997012.png"
  },
  {
    "player": "Gregor Kobel",
    "id": 556866,
    "url": "https://api.sofascore.app/api/v1/player/556866/heatmap/overall",
    "file": "assets/heatmaps/556866.png"
  },
  {
    "player": "Robin Koch",
    "id": 581302,
    "url": "https://api.sofascore.app/api/v1/player/581302/heatmap/overall",
    "file": "assets/heatmaps/581302.png"
  },
  {
    "player": "Christian Kofane",
    "id": 2029648,
    "url": "https://api.sofascore.app/api/v1/player/2029648/heatmap/overall",
    "file": "assets/heatmaps/2029648.png"
  },
  {
    "player": "Hervé Koffi",
    "id": 867299,
    "url": "https://api.sofascore.app/api/v1/player/867299/heatmap/overall",
    "file": "assets/heatmaps/867299.png"
  },
  {
    "player": "Derrick Köhn",
    "id": 886737,
    "url": "https://api.sofascore.app/api/v1/player/886737/heatmap/overall",
    "file": "assets/heatmaps/886737.png"
  },
  {
    "player": "Philipp Köhn",
    "id": 868964,
    "url": "https://api.sofascore.app/api/v1/player/868964/heatmap/overall",
    "file": "assets/heatmaps/868964.png"
  },
  {
    "player": "Dominik Kohr",
    "id": 152206,
    "url": "https://api.sofascore.app/api/v1/player/152206/heatmap/overall",
    "file": "assets/heatmaps/152206.png"
  },
  {
    "player": "Koke",
    "id": 84539,
    "url": "https://api.sofascore.app/api/v1/player/84539/heatmap/overall",
    "file": "assets/heatmaps/84539.png"
  },
  {
    "player": "Sead Kolašinac",
    "id": 142148,
    "url": "https://api.sofascore.app/api/v1/player/142148/heatmap/overall",
    "file": "assets/heatmaps/142148.png"
  },
  {
    "player": "Adam Kölle",
    "id": 2192753,
    "url": "https://api.sofascore.app/api/v1/player/2192753/heatmap/overall",
    "file": "assets/heatmaps/2192753.png"
  },
  {
    "player": "Randal Kolo Muani",
    "id": 871706,
    "url": "https://api.sofascore.app/api/v1/player/871706/heatmap/overall",
    "file": "assets/heatmaps/871706.png"
  },
  {
    "player": "Mert Kömür",
    "id": 1390682,
    "url": "https://api.sofascore.app/api/v1/player/1390682/heatmap/overall",
    "file": "assets/heatmaps/1390682.png"
  },
  {
    "player": "Ibrahima Konaté",
    "id": 826215,
    "url": "https://api.sofascore.app/api/v1/player/826215/heatmap/overall",
    "file": "assets/heatmaps/826215.png"
  },
  {
    "player": "Samba Konaté",
    "id": 2331057,
    "url": "https://api.sofascore.app/api/v1/player/2331057/heatmap/overall",
    "file": "assets/heatmaps/2331057.png"
  },
  {
    "player": "Geoffrey Kondogbia",
    "id": 96544,
    "url": "https://api.sofascore.app/api/v1/player/96544/heatmap/overall",
    "file": "assets/heatmaps/96544.png"
  },
  {
    "player": "Ismaël Koné",
    "id": 1134351,
    "url": "https://api.sofascore.app/api/v1/player/1134351/heatmap/overall",
    "file": "assets/heatmaps/1134351.png"
  },
  {
    "player": "Manu Koné",
    "id": 974087,
    "url": "https://api.sofascore.app/api/v1/player/974087/heatmap/overall",
    "file": "assets/heatmaps/974087.png"
  },
  {
    "player": "Ransford Königsdörffer",
    "id": 1012235,
    "url": "https://api.sofascore.app/api/v1/player/1012235/heatmap/overall",
    "file": "assets/heatmaps/1012235.png"
  },
  {
    "player": "Ezri Konsa",
    "id": 827679,
    "url": "https://api.sofascore.app/api/v1/player/827679/heatmap/overall",
    "file": "assets/heatmaps/827679.png"
  },
  {
    "player": "Teun Koopmeiners",
    "id": 803033,
    "url": "https://api.sofascore.app/api/v1/player/803033/heatmap/overall",
    "file": "assets/heatmaps/803033.png"
  },
  {
    "player": "Ville Koski",
    "id": 999178,
    "url": "https://api.sofascore.app/api/v1/player/999178/heatmap/overall",
    "file": "assets/heatmaps/999178.png"
  },
  {
    "player": "Odilon Kossounou",
    "id": 973437,
    "url": "https://api.sofascore.app/api/v1/player/973437/heatmap/overall",
    "file": "assets/heatmaps/973437.png"
  },
  {
    "player": "Filip Kostić",
    "id": 126588,
    "url": "https://api.sofascore.app/api/v1/player/126588/heatmap/overall",
    "file": "assets/heatmaps/126588.png"
  },
  {
    "player": "Charalampos Kostoulas",
    "id": 1416535,
    "url": "https://api.sofascore.app/api/v1/player/1416535/heatmap/overall",
    "file": "assets/heatmaps/1416535.png"
  },
  {
    "player": "Eddy Kouadio",
    "id": 1526933,
    "url": "https://api.sofascore.app/api/v1/player/1526933/heatmap/overall",
    "file": "assets/heatmaps/1526933.png"
  },
  {
    "player": "Koffi Kouao",
    "id": 867575,
    "url": "https://api.sofascore.app/api/v1/player/867575/heatmap/overall",
    "file": "assets/heatmaps/867575.png"
  },
  {
    "player": "Arsène Kouassi",
    "id": 1855502,
    "url": "https://api.sofascore.app/api/v1/player/1855502/heatmap/overall",
    "file": "assets/heatmaps/1855502.png"
  },
  {
    "player": "Konstantinos Koulierakis",
    "id": 1184855,
    "url": "https://api.sofascore.app/api/v1/player/1184855/heatmap/overall",
    "file": "assets/heatmaps/1184855.png"
  },
  {
    "player": "Seny Koumbassa",
    "id": 2077075,
    "url": "https://api.sofascore.app/api/v1/player/2077075/heatmap/overall",
    "file": "assets/heatmaps/2077075.png"
  },
  {
    "player": "Jules Koundé",
    "id": 827212,
    "url": "https://api.sofascore.app/api/v1/player/827212/heatmap/overall",
    "file": "assets/heatmaps/827212.png"
  },
  {
    "player": "Mateo Kovačić",
    "id": 136710,
    "url": "https://api.sofascore.app/api/v1/player/136710/heatmap/overall",
    "file": "assets/heatmaps/136710.png"
  },
  {
    "player": "Emil Krafth",
    "id": 150396,
    "url": "https://api.sofascore.app/api/v1/player/150396/heatmap/overall",
    "file": "assets/heatmaps/150396.png"
  },
  {
    "player": "Alex Král",
    "id": 825740,
    "url": "https://api.sofascore.app/api/v1/player/825740/heatmap/overall",
    "file": "assets/heatmaps/825740.png"
  },
  {
    "player": "Andrej Kramarić",
    "id": 67647,
    "url": "https://api.sofascore.app/api/v1/player/67647/heatmap/overall",
    "file": "assets/heatmaps/67647.png"
  },
  {
    "player": "Vladyslav Krapyvtsov",
    "id": 1521733,
    "url": "https://api.sofascore.app/api/v1/player/1521733/heatmap/overall",
    "file": "assets/heatmaps/1521733.png"
  },
  {
    "player": "Tom Krauß",
    "id": 930272,
    "url": "https://api.sofascore.app/api/v1/player/930272/heatmap/overall",
    "file": "assets/heatmaps/930272.png"
  },
  {
    "player": "Rasmus Kristensen",
    "id": 921789,
    "url": "https://api.sofascore.app/api/v1/player/921789/heatmap/overall",
    "file": "assets/heatmaps/921789.png"
  },
  {
    "player": "Thomas Kristensen",
    "id": 1063373,
    "url": "https://api.sofascore.app/api/v1/player/1063373/heatmap/overall",
    "file": "assets/heatmaps/1063373.png"
  },
  {
    "player": "Nikola Krstović",
    "id": 839156,
    "url": "https://api.sofascore.app/api/v1/player/839156/heatmap/overall",
    "file": "assets/heatmaps/839156.png"
  },
  {
    "player": "Lukas Kübler",
    "id": 142525,
    "url": "https://api.sofascore.app/api/v1/player/142525/heatmap/overall",
    "file": "assets/heatmaps/142525.png"
  },
  {
    "player": "Takefusa Kubo",
    "id": 880218,
    "url": "https://api.sofascore.app/api/v1/player/880218/heatmap/overall",
    "file": "assets/heatmaps/880218.png"
  },
  {
    "player": "Mohammed Kudus",
    "id": 905163,
    "url": "https://api.sofascore.app/api/v1/player/905163/heatmap/overall",
    "file": "assets/heatmaps/905163.png"
  },
  {
    "player": "Nicolas-Gerrit Kühn",
    "id": 877835,
    "url": "https://api.sofascore.app/api/v1/player/877835/heatmap/overall",
    "file": "assets/heatmaps/877835.png"
  },
  {
    "player": "Sandro Kulenović",
    "id": 826026,
    "url": "https://api.sofascore.app/api/v1/player/826026/heatmap/overall",
    "file": "assets/heatmaps/826026.png"
  },
  {
    "player": "Marash Kumbulla",
    "id": 893642,
    "url": "https://api.sofascore.app/api/v1/player/893642/heatmap/overall",
    "file": "assets/heatmaps/893642.png"
  },
  {
    "player": "Jonah Kusi-Asare",
    "id": 1503757,
    "url": "https://api.sofascore.app/api/v1/player/1503757/heatmap/overall",
    "file": "assets/heatmaps/1503757.png"
  },
  {
    "player": "Khvicha Kvaratskhelia",
    "id": 889259,
    "url": "https://api.sofascore.app/api/v1/player/889259/heatmap/overall",
    "file": "assets/heatmaps/889259.png"
  },
  {
    "player": "Giorgi Kvilitaia",
    "id": 300412,
    "url": "https://api.sofascore.app/api/v1/player/300412/heatmap/overall",
    "file": "assets/heatmaps/300412.png"
  },
  {
    "player": "Godson Kyeremeh",
    "id": 975300,
    "url": "https://api.sofascore.app/api/v1/player/975300/heatmap/overall",
    "file": "assets/heatmaps/975300.png"
  },
  {
    "player": "Adrián de la Fuente",
    "id": 997244,
    "url": "https://api.sofascore.app/api/v1/player/997244/heatmap/overall",
    "file": "assets/heatmaps/997244.png"
  },
  {
    "player": "Rémy Labeau Lascary",
    "id": 1401005,
    "url": "https://api.sofascore.app/api/v1/player/1401005/heatmap/overall",
    "file": "assets/heatmaps/1401005.png"
  },
  {
    "player": "Shea Lacey",
    "id": 1465865,
    "url": "https://api.sofascore.app/api/v1/player/1465865/heatmap/overall",
    "file": "assets/heatmaps/1465865.png"
  },
  {
    "player": "Maxence Lacroix",
    "id": 879674,
    "url": "https://api.sofascore.app/api/v1/player/879674/heatmap/overall",
    "file": "assets/heatmaps/879674.png"
  },
  {
    "player": "Yoel Lago",
    "id": 1145100,
    "url": "https://api.sofascore.app/api/v1/player/1145100/heatmap/overall",
    "file": "assets/heatmaps/1145100.png"
  },
  {
    "player": "Konrad Laimer",
    "id": 355492,
    "url": "https://api.sofascore.app/api/v1/player/355492/heatmap/overall",
    "file": "assets/heatmaps/355492.png"
  },
  {
    "player": "Kenny Lala",
    "id": 141080,
    "url": "https://api.sofascore.app/api/v1/player/141080/heatmap/overall",
    "file": "assets/heatmaps/141080.png"
  },
  {
    "player": "Senne Lammens",
    "id": 964753,
    "url": "https://api.sofascore.app/api/v1/player/964753/heatmap/overall",
    "file": "assets/heatmaps/964753.png"
  },
  {
    "player": "Tariq Lamptey",
    "id": 914691,
    "url": "https://api.sofascore.app/api/v1/player/914691/heatmap/overall",
    "file": "assets/heatmaps/914691.png"
  },
  {
    "player": "Aymeric Laporte",
    "id": 149734,
    "url": "https://api.sofascore.app/api/v1/player/149734/heatmap/overall",
    "file": "assets/heatmaps/149734.png"
  },
  {
    "player": "Hugo Larsson",
    "id": 1142211,
    "url": "https://api.sofascore.app/api/v1/player/1142211/heatmap/overall",
    "file": "assets/heatmaps/1142211.png"
  },
  {
    "player": "Toni Lato",
    "id": 828239,
    "url": "https://api.sofascore.app/api/v1/player/828239/heatmap/overall",
    "file": "assets/heatmaps/828239.png"
  },
  {
    "player": "Josh Laurent",
    "id": 552036,
    "url": "https://api.sofascore.app/api/v1/player/552036/heatmap/overall",
    "file": "assets/heatmaps/552036.png"
  },
  {
    "player": "Armand Lauriente",
    "id": 932643,
    "url": "https://api.sofascore.app/api/v1/player/932643/heatmap/overall",
    "file": "assets/heatmaps/932643.png"
  },
  {
    "player": "Roméo Lavia",
    "id": 1069488,
    "url": "https://api.sofascore.app/api/v1/player/1069488/heatmap/overall",
    "file": "assets/heatmaps/1069488.png"
  },
  {
    "player": "Valentino Lazaro",
    "id": 233826,
    "url": "https://api.sofascore.app/api/v1/player/233826/heatmap/overall",
    "file": "assets/heatmaps/233826.png"
  },
  {
    "player": "Manuel Lazzari",
    "id": 273405,
    "url": "https://api.sofascore.app/api/v1/player/273405/heatmap/overall",
    "file": "assets/heatmaps/273405.png"
  },
  {
    "player": "Théo Le Bris",
    "id": 1131540,
    "url": "https://api.sofascore.app/api/v1/player/1131540/heatmap/overall",
    "file": "assets/heatmaps/1131540.png"
  },
  {
    "player": "Enzo Le Fée",
    "id": 984014,
    "url": "https://api.sofascore.app/api/v1/player/984014/heatmap/overall",
    "file": "assets/heatmaps/984014.png"
  },
  {
    "player": "Raphael Le Guen",
    "id": 1894085,
    "url": "https://api.sofascore.app/api/v1/player/1894085/heatmap/overall",
    "file": "assets/heatmaps/1894085.png"
  },
  {
    "player": "Robin Le Normand",
    "id": 787751,
    "url": "https://api.sofascore.app/api/v1/player/787751/heatmap/overall",
    "file": "assets/heatmaps/787751.png"
  },
  {
    "player": "Nicola Leali",
    "id": 98059,
    "url": "https://api.sofascore.app/api/v1/player/98059/heatmap/overall",
    "file": "assets/heatmaps/98059.png"
  },
  {
    "player": "Rafael Leão",
    "id": 851284,
    "url": "https://api.sofascore.app/api/v1/player/851284/heatmap/overall",
    "file": "assets/heatmaps/851284.png"
  },
  {
    "player": "Jordan Lefort",
    "id": 363042,
    "url": "https://api.sofascore.app/api/v1/player/363042/heatmap/overall",
    "file": "assets/heatmaps/363042.png"
  },
  {
    "player": "Diogo Leite",
    "id": 855663,
    "url": "https://api.sofascore.app/api/v1/player/855663/heatmap/overall",
    "file": "assets/heatmaps/855663.png"
  },
  {
    "player": "Maxim Leitsch",
    "id": 842869,
    "url": "https://api.sofascore.app/api/v1/player/842869/heatmap/overall",
    "file": "assets/heatmaps/842869.png"
  },
  {
    "player": "Florian Lejeune",
    "id": 88528,
    "url": "https://api.sofascore.app/api/v1/player/88528/heatmap/overall",
    "file": "assets/heatmaps/88528.png"
  },
  {
    "player": "Youssef Lekhedim",
    "id": 1403364,
    "url": "https://api.sofascore.app/api/v1/player/1403364/heatmap/overall",
    "file": "assets/heatmaps/1403364.png"
  },
  {
    "player": "Iñigo Lekue",
    "id": 801837,
    "url": "https://api.sofascore.app/api/v1/player/801837/heatmap/overall",
    "file": "assets/heatmaps/801837.png"
  },
  {
    "player": "Thomas Lemar",
    "id": 191182,
    "url": "https://api.sofascore.app/api/v1/player/191182/heatmap/overall",
    "file": "assets/heatmaps/191182.png"
  },
  {
    "player": "Tim Lemperle",
    "id": 1014290,
    "url": "https://api.sofascore.app/api/v1/player/1014290/heatmap/overall",
    "file": "assets/heatmaps/1014290.png"
  },
  {
    "player": "Clément Lenglet",
    "id": 580550,
    "url": "https://api.sofascore.app/api/v1/player/580550/heatmap/overall",
    "file": "assets/heatmaps/580550.png"
  },
  {
    "player": "Bernd Leno",
    "id": 103335,
    "url": "https://api.sofascore.app/api/v1/player/103335/heatmap/overall",
    "file": "assets/heatmaps/103335.png"
  },
  {
    "player": "Donovan Léon",
    "id": 159837,
    "url": "https://api.sofascore.app/api/v1/player/159837/heatmap/overall",
    "file": "assets/heatmaps/159837.png"
  },
  {
    "player": "Esteban Lepaul",
    "id": 966621,
    "url": "https://api.sofascore.app/api/v1/player/966621/heatmap/overall",
    "file": "assets/heatmaps/966621.png"
  },
  {
    "player": "Johann Lepenant",
    "id": 963299,
    "url": "https://api.sofascore.app/api/v1/player/963299/heatmap/overall",
    "file": "assets/heatmaps/963299.png"
  },
  {
    "player": "Mehdi Léris",
    "id": 851222,
    "url": "https://api.sofascore.app/api/v1/player/851222/heatmap/overall",
    "file": "assets/heatmaps/851222.png"
  },
  {
    "player": "Jefferson Lerma",
    "id": 355796,
    "url": "https://api.sofascore.app/api/v1/player/355796/heatmap/overall",
    "file": "assets/heatmaps/355796.png"
  },
  {
    "player": "Louis Leroux",
    "id": 1405998,
    "url": "https://api.sofascore.app/api/v1/player/1405998/heatmap/overall",
    "file": "assets/heatmaps/1405998.png"
  },
  {
    "player": "Robert Lewandowski",
    "id": 41789,
    "url": "https://api.sofascore.app/api/v1/player/41789/heatmap/overall",
    "file": "assets/heatmaps/41789.png"
  },
  {
    "player": "Jamie Leweling",
    "id": 990201,
    "url": "https://api.sofascore.app/api/v1/player/990201/heatmap/overall",
    "file": "assets/heatmaps/990201.png"
  },
  {
    "player": "Rico Lewis",
    "id": 1136731,
    "url": "https://api.sofascore.app/api/v1/player/1136731/heatmap/overall",
    "file": "assets/heatmaps/1136731.png"
  },
  {
    "player": "Keane Lewis-Potter",
    "id": 972421,
    "url": "https://api.sofascore.app/api/v1/player/972421/heatmap/overall",
    "file": "assets/heatmaps/972421.png"
  },
  {
    "player": "Myles Lewis-Skelly",
    "id": 1423711,
    "url": "https://api.sofascore.app/api/v1/player/1423711/heatmap/overall",
    "file": "assets/heatmaps/1423711.png"
  },
  {
    "player": "Philipp Lienhart",
    "id": 576266,
    "url": "https://api.sofascore.app/api/v1/player/576266/heatmap/overall",
    "file": "assets/heatmaps/576266.png"
  },
  {
    "player": "Matthijs de Ligt",
    "id": 803031,
    "url": "https://api.sofascore.app/api/v1/player/803031/heatmap/overall",
    "file": "assets/heatmaps/803031.png"
  },
  {
    "player": "Pedro Lima",
    "id": 1597270,
    "url": "https://api.sofascore.app/api/v1/player/1597270/heatmap/overall",
    "file": "assets/heatmaps/1597270.png"
  },
  {
    "player": "Victor Lindelöf",
    "id": 143334,
    "url": "https://api.sofascore.app/api/v1/player/143334/heatmap/overall",
    "file": "assets/heatmaps/143334.png"
  },
  {
    "player": "Jesper Lindstrøm",
    "id": 947929,
    "url": "https://api.sofascore.app/api/v1/player/947929/heatmap/overall",
    "file": "assets/heatmaps/947929.png"
  },
  {
    "player": "Luca Lipani",
    "id": 1154898,
    "url": "https://api.sofascore.app/api/v1/player/1154898/heatmap/overall",
    "file": "assets/heatmaps/1154898.png"
  },
  {
    "player": "Adrián Liso",
    "id": 1515554,
    "url": "https://api.sofascore.app/api/v1/player/1515554/heatmap/overall",
    "file": "assets/heatmaps/1515554.png"
  },
  {
    "player": "Joseph Liteta",
    "id": 1910527,
    "url": "https://api.sofascore.app/api/v1/player/1910527/heatmap/overall",
    "file": "assets/heatmaps/1910527.png"
  },
  {
    "player": "Valentino Livramento",
    "id": 980634,
    "url": "https://api.sofascore.app/api/v1/player/980634/heatmap/overall",
    "file": "assets/heatmaps/980634.png"
  },
  {
    "player": "Javier Llabrés",
    "id": 1162309,
    "url": "https://api.sofascore.app/api/v1/player/1162309/heatmap/overall",
    "file": "assets/heatmaps/1162309.png"
  },
  {
    "player": "Diego Llorente",
    "id": 305278,
    "url": "https://api.sofascore.app/api/v1/player/305278/heatmap/overall",
    "file": "assets/heatmaps/305278.png"
  },
  {
    "player": "Marcos Llorente",
    "id": 353138,
    "url": "https://api.sofascore.app/api/v1/player/353138/heatmap/overall",
    "file": "assets/heatmaps/353138.png"
  },
  {
    "player": "Gautier Lloris",
    "id": 287887,
    "url": "https://api.sofascore.app/api/v1/player/287887/heatmap/overall",
    "file": "assets/heatmaps/287887.png"
  },
  {
    "player": "Giovani Lo Celso",
    "id": 798835,
    "url": "https://api.sofascore.app/api/v1/player/798835/heatmap/overall",
    "file": "assets/heatmaps/798835.png"
  },
  {
    "player": "Stanislav Lobotka",
    "id": 150383,
    "url": "https://api.sofascore.app/api/v1/player/150383/heatmap/overall",
    "file": "assets/heatmaps/150383.png"
  },
  {
    "player": "Manuel Locatelli",
    "id": 363860,
    "url": "https://api.sofascore.app/api/v1/player/363860/heatmap/overall",
    "file": "assets/heatmaps/363860.png"
  },
  {
    "player": "Bradley Locko",
    "id": 1129382,
    "url": "https://api.sofascore.app/api/v1/player/1129382/heatmap/overall",
    "file": "assets/heatmaps/1129382.png"
  },
  {
    "player": "Ruben Loftus-Cheek",
    "id": 284441,
    "url": "https://api.sofascore.app/api/v1/player/284441/heatmap/overall",
    "file": "assets/heatmaps/284441.png"
  },
  {
    "player": "Sean Longstaff",
    "id": 866191,
    "url": "https://api.sofascore.app/api/v1/player/866191/heatmap/overall",
    "file": "assets/heatmaps/866191.png"
  },
  {
    "player": "Ademola Lookman",
    "id": 824200,
    "url": "https://api.sofascore.app/api/v1/player/824200/heatmap/overall",
    "file": "assets/heatmaps/824200.png"
  },
  {
    "player": "Anthony Lopes",
    "id": 48535,
    "url": "https://api.sofascore.app/api/v1/player/48535/heatmap/overall",
    "file": "assets/heatmaps/48535.png"
  },
  {
    "player": "David López",
    "id": 135116,
    "url": "https://api.sofascore.app/api/v1/player/135116/heatmap/overall",
    "file": "assets/heatmaps/135116.png"
  },
  {
    "player": "Diego López",
    "id": 998950,
    "url": "https://api.sofascore.app/api/v1/player/998950/heatmap/overall",
    "file": "assets/heatmaps/998950.png"
  },
  {
    "player": "Fer López",
    "id": 1526628,
    "url": "https://api.sofascore.app/api/v1/player/1526628/heatmap/overall",
    "file": "assets/heatmaps/1526628.png"
  },
  {
    "player": "Fermin López",
    "id": 1153270,
    "url": "https://api.sofascore.app/api/v1/player/1153270/heatmap/overall",
    "file": "assets/heatmaps/1153270.png"
  },
  {
    "player": "Hugo López",
    "id": 1966890,
    "url": "https://api.sofascore.app/api/v1/player/1966890/heatmap/overall",
    "file": "assets/heatmaps/1966890.png"
  },
  {
    "player": "Javi López",
    "id": 945404,
    "url": "https://api.sofascore.app/api/v1/player/945404/heatmap/overall",
    "file": "assets/heatmaps/945404.png"
  },
  {
    "player": "Pau López",
    "id": 548848,
    "url": "https://api.sofascore.app/api/v1/player/548848/heatmap/overall",
    "file": "assets/heatmaps/548848.png"
  },
  {
    "player": "Unai López",
    "id": 588566,
    "url": "https://api.sofascore.app/api/v1/player/588566/heatmap/overall",
    "file": "assets/heatmaps/588566.png"
  },
  {
    "player": "Lorran",
    "id": 1459764,
    "url": "https://api.sofascore.app/api/v1/player/1459764/heatmap/overall",
    "file": "assets/heatmaps/1459764.png"
  },
  {
    "player": "Iker Losada",
    "id": 992331,
    "url": "https://api.sofascore.app/api/v1/player/992331/heatmap/overall",
    "file": "assets/heatmaps/992331.png"
  },
  {
    "player": "Marius Louer",
    "id": 1862843,
    "url": "https://api.sofascore.app/api/v1/player/1862843/heatmap/overall",
    "file": "assets/heatmaps/1862843.png"
  },
  {
    "player": "Sandi Lovrić",
    "id": 575852,
    "url": "https://api.sofascore.app/api/v1/player/575852/heatmap/overall",
    "file": "assets/heatmaps/575852.png"
  },
  {
    "player": "Felipe Loyola",
    "id": 1125917,
    "url": "https://api.sofascore.app/api/v1/player/1125917/heatmap/overall",
    "file": "assets/heatmaps/1125917.png"
  },
  {
    "player": "Pol Lozano",
    "id": 826010,
    "url": "https://api.sofascore.app/api/v1/player/826010/heatmap/overall",
    "file": "assets/heatmaps/826010.png"
  },
  {
    "player": "Lucas",
    "id": 1136896,
    "url": "https://api.sofascore.app/api/v1/player/1136896/heatmap/overall",
    "file": "assets/heatmaps/1136896.png"
  },
  {
    "player": "Lorenzo Lucca",
    "id": 962364,
    "url": "https://api.sofascore.app/api/v1/player/962364/heatmap/overall",
    "file": "assets/heatmaps/962364.png"
  },
  {
    "player": "Jhon Lucumí",
    "id": 818481,
    "url": "https://api.sofascore.app/api/v1/player/818481/heatmap/overall",
    "file": "assets/heatmaps/818481.png"
  },
  {
    "player": "Florentino Luís",
    "id": 855845,
    "url": "https://api.sofascore.app/api/v1/player/855845/heatmap/overall",
    "file": "assets/heatmaps/855845.png"
  },
  {
    "player": "José Luis Gayà",
    "id": 227922,
    "url": "https://api.sofascore.app/api/v1/player/227922/heatmap/overall",
    "file": "assets/heatmaps/227922.png"
  },
  {
    "player": "José Luis Morales",
    "id": 344129,
    "url": "https://api.sofascore.app/api/v1/player/344129/heatmap/overall",
    "file": "assets/heatmaps/344129.png"
  },
  {
    "player": "Romelu Lukaku",
    "id": 78893,
    "url": "https://api.sofascore.app/api/v1/player/78893/heatmap/overall",
    "file": "assets/heatmaps/78893.png"
  },
  {
    "player": "Castello Lukeba",
    "id": 976421,
    "url": "https://api.sofascore.app/api/v1/player/976421/heatmap/overall",
    "file": "assets/heatmaps/976421.png"
  },
  {
    "player": "Saša Lukić",
    "id": 371222,
    "url": "https://api.sofascore.app/api/v1/player/371222/heatmap/overall",
    "file": "assets/heatmaps/371222.png"
  },
  {
    "player": "Kristoffer Lund",
    "id": 963043,
    "url": "https://api.sofascore.app/api/v1/player/963043/heatmap/overall",
    "file": "assets/heatmaps/963043.png"
  },
  {
    "player": "Senne Lynen",
    "id": 826171,
    "url": "https://api.sofascore.app/api/v1/player/826171/heatmap/overall",
    "file": "assets/heatmaps/826171.png"
  },
  {
    "player": "Ian Maatsen",
    "id": 976263,
    "url": "https://api.sofascore.app/api/v1/player/976263/heatmap/overall",
    "file": "assets/heatmaps/976263.png"
  },
  {
    "player": "Alexis Mac Allister",
    "id": 895324,
    "url": "https://api.sofascore.app/api/v1/player/895324/heatmap/overall",
    "file": "assets/heatmaps/895324.png"
  },
  {
    "player": "Koki Machida",
    "id": 790977,
    "url": "https://api.sofascore.app/api/v1/player/790977/heatmap/overall",
    "file": "assets/heatmaps/790977.png"
  },
  {
    "player": "Lanroy Machine",
    "id": 2142283,
    "url": "https://api.sofascore.app/api/v1/player/2142283/heatmap/overall",
    "file": "assets/heatmaps/2142283.png"
  },
  {
    "player": "Shuto Machino",
    "id": 925910,
    "url": "https://api.sofascore.app/api/v1/player/925910/heatmap/overall",
    "file": "assets/heatmaps/925910.png"
  },
  {
    "player": "Carlos Macià",
    "id": 2238900,
    "url": "https://api.sofascore.app/api/v1/player/2238900/heatmap/overall",
    "file": "assets/heatmaps/2238900.png"
  },
  {
    "player": "Noni Madueke",
    "id": 966547,
    "url": "https://api.sofascore.app/api/v1/player/966547/heatmap/overall",
    "file": "assets/heatmaps/966547.png"
  },
  {
    "player": "Pablo Maffeo",
    "id": 788216,
    "url": "https://api.sofascore.app/api/v1/player/788216/heatmap/overall",
    "file": "assets/heatmaps/788216.png"
  },
  {
    "player": "Gabriel Magalhães",
    "id": 869792,
    "url": "https://api.sofascore.app/api/v1/player/869792/heatmap/overall",
    "file": "assets/heatmaps/869792.png"
  },
  {
    "player": "Soungoutou Magassa",
    "id": 1170560,
    "url": "https://api.sofascore.app/api/v1/player/1170560/heatmap/overall",
    "file": "assets/heatmaps/1170560.png"
  },
  {
    "player": "Hugo Magnetti",
    "id": 861324,
    "url": "https://api.sofascore.app/api/v1/player/861324/heatmap/overall",
    "file": "assets/heatmaps/861324.png"
  },
  {
    "player": "Frank Magri",
    "id": 1169436,
    "url": "https://api.sofascore.app/api/v1/player/1169436/heatmap/overall",
    "file": "assets/heatmaps/1169436.png"
  },
  {
    "player": "Harry Maguire",
    "id": 149380,
    "url": "https://api.sofascore.app/api/v1/player/149380/heatmap/overall",
    "file": "assets/heatmaps/149380.png"
  },
  {
    "player": "Mike Maignan",
    "id": 191210,
    "url": "https://api.sofascore.app/api/v1/player/191210/heatmap/overall",
    "file": "assets/heatmaps/191210.png"
  },
  {
    "player": "Linton Maina",
    "id": 921033,
    "url": "https://api.sofascore.app/api/v1/player/921033/heatmap/overall",
    "file": "assets/heatmaps/921033.png"
  },
  {
    "player": "Patrick Mainka",
    "id": 254429,
    "url": "https://api.sofascore.app/api/v1/player/254429/heatmap/overall",
    "file": "assets/heatmaps/254429.png"
  },
  {
    "player": "Kobbie Mainoo",
    "id": 1142175,
    "url": "https://api.sofascore.app/api/v1/player/1142175/heatmap/overall",
    "file": "assets/heatmaps/1142175.png"
  },
  {
    "player": "Ainsley Maitland-Niles",
    "id": 352768,
    "url": "https://api.sofascore.app/api/v1/player/352768/heatmap/overall",
    "file": "assets/heatmaps/352768.png"
  },
  {
    "player": "Radosław Majecki",
    "id": 849114,
    "url": "https://api.sofascore.app/api/v1/player/849114/heatmap/overall",
    "file": "assets/heatmaps/849114.png"
  },
  {
    "player": "Lovro Majer",
    "id": 841947,
    "url": "https://api.sofascore.app/api/v1/player/841947/heatmap/overall",
    "file": "assets/heatmaps/841947.png"
  },
  {
    "player": "Hamidou Makalou",
    "id": 1597197,
    "url": "https://api.sofascore.app/api/v1/player/1597197/heatmap/overall",
    "file": "assets/heatmaps/1597197.png"
  },
  {
    "player": "Jean-Victor Makengo",
    "id": 802138,
    "url": "https://api.sofascore.app/api/v1/player/802138/heatmap/overall",
    "file": "assets/heatmaps/802138.png"
  },
  {
    "player": "Jordy Makengo",
    "id": 1131339,
    "url": "https://api.sofascore.app/api/v1/player/1131339/heatmap/overall",
    "file": "assets/heatmaps/1131339.png"
  },
  {
    "player": "Andrija Maksimović",
    "id": 1406171,
    "url": "https://api.sofascore.app/api/v1/player/1406171/heatmap/overall",
    "file": "assets/heatmaps/1406171.png"
  },
  {
    "player": "Said El Mala",
    "id": 1800475,
    "url": "https://api.sofascore.app/api/v1/player/1800475/heatmap/overall",
    "file": "assets/heatmaps/1800475.png"
  },
  {
    "player": "Tyrell Malacia",
    "id": 825839,
    "url": "https://api.sofascore.app/api/v1/player/825839/heatmap/overall",
    "file": "assets/heatmaps/825839.png"
  },
  {
    "player": "Julián Malatini",
    "id": 1087043,
    "url": "https://api.sofascore.app/api/v1/player/1087043/heatmap/overall",
    "file": "assets/heatmaps/1087043.png"
  },
  {
    "player": "Donyell Malen",
    "id": 803039,
    "url": "https://api.sofascore.app/api/v1/player/803039/heatmap/overall",
    "file": "assets/heatmaps/803039.png"
  },
  {
    "player": "Ruslan Malinovskyi",
    "id": 195850,
    "url": "https://api.sofascore.app/api/v1/player/195850/heatmap/overall",
    "file": "assets/heatmaps/195850.png"
  },
  {
    "player": "Lennard Maloney",
    "id": 893962,
    "url": "https://api.sofascore.app/api/v1/player/893962/heatmap/overall",
    "file": "assets/heatmaps/893962.png"
  },
  {
    "player": "Pape Mamadou Sy",
    "id": 1463509,
    "url": "https://api.sofascore.app/api/v1/player/1463509/heatmap/overall",
    "file": "assets/heatmaps/1463509.png"
  },
  {
    "player": "Giorgi Mamardashvili",
    "id": 930997,
    "url": "https://api.sofascore.app/api/v1/player/930997/heatmap/overall",
    "file": "assets/heatmaps/930997.png"
  },
  {
    "player": "Felix Mambimbi",
    "id": 910076,
    "url": "https://api.sofascore.app/api/v1/player/910076/heatmap/overall",
    "file": "assets/heatmaps/910076.png"
  },
  {
    "player": "Aitor Mañas",
    "id": 1639543,
    "url": "https://api.sofascore.app/api/v1/player/1639543/heatmap/overall",
    "file": "assets/heatmaps/1639543.png"
  },
  {
    "player": "Gianluca Mancini",
    "id": 611210,
    "url": "https://api.sofascore.app/api/v1/player/611210/heatmap/overall",
    "file": "assets/heatmaps/611210.png"
  },
  {
    "player": "Reinildo Mandava",
    "id": 831424,
    "url": "https://api.sofascore.app/api/v1/player/831424/heatmap/overall",
    "file": "assets/heatmaps/831424.png"
  },
  {
    "player": "Aïssa Mandi",
    "id": 122810,
    "url": "https://api.sofascore.app/api/v1/player/122810/heatmap/overall",
    "file": "assets/heatmaps/122810.png"
  },
  {
    "player": "Rolando Mandragora",
    "id": 548178,
    "url": "https://api.sofascore.app/api/v1/player/548178/heatmap/overall",
    "file": "assets/heatmaps/548178.png"
  },
  {
    "player": "Filippo Mane",
    "id": 1137131,
    "url": "https://api.sofascore.app/api/v1/player/1137131/heatmap/overall",
    "file": "assets/heatmaps/1137131.png"
  },
  {
    "player": "Mateus Mane",
    "id": 1899647,
    "url": "https://api.sofascore.app/api/v1/player/1899647/heatmap/overall",
    "file": "assets/heatmaps/1899647.png"
  },
  {
    "player": "Orel Mangala",
    "id": 793988,
    "url": "https://api.sofascore.app/api/v1/player/793988/heatmap/overall",
    "file": "assets/heatmaps/793988.png"
  },
  {
    "player": "Bendito Mantato",
    "id": 1545190,
    "url": "https://api.sofascore.app/api/v1/player/1545190/heatmap/overall",
    "file": "assets/heatmaps/1545190.png"
  },
  {
    "player": "Johan Manzambi",
    "id": 1518931,
    "url": "https://api.sofascore.app/api/v1/player/1518931/heatmap/overall",
    "file": "assets/heatmaps/1518931.png"
  },
  {
    "player": "Sekou Mara",
    "id": 1047484,
    "url": "https://api.sofascore.app/api/v1/player/1047484/heatmap/overall",
    "file": "assets/heatmaps/1047484.png"
  },
  {
    "player": "Alessandro Marcandalli",
    "id": 1068885,
    "url": "https://api.sofascore.app/api/v1/player/1068885/heatmap/overall",
    "file": "assets/heatmaps/1068885.png"
  },
  {
    "player": "Marcão",
    "id": 840951,
    "url": "https://api.sofascore.app/api/v1/player/840951/heatmap/overall",
    "file": "assets/heatmaps/840951.png"
  },
  {
    "player": "Solly March",
    "id": 301288,
    "url": "https://api.sofascore.app/api/v1/player/301288/heatmap/overall",
    "file": "assets/heatmaps/301288.png"
  },
  {
    "player": "José María Giménez",
    "id": 325355,
    "url": "https://api.sofascore.app/api/v1/player/325355/heatmap/overall",
    "file": "assets/heatmaps/325355.png"
  },
  {
    "player": "Mariano",
    "id": 175753,
    "url": "https://api.sofascore.app/api/v1/player/175753/heatmap/overall",
    "file": "assets/heatmaps/175753.png"
  },
  {
    "player": "Arkaitz Mariezkurrena",
    "id": 1526575,
    "url": "https://api.sofascore.app/api/v1/player/1526575/heatmap/overall",
    "file": "assets/heatmaps/1526575.png"
  },
  {
    "player": "Rafa Marín",
    "id": 984623,
    "url": "https://api.sofascore.app/api/v1/player/984623/heatmap/overall",
    "file": "assets/heatmaps/984623.png"
  },
  {
    "player": "Marius Marin",
    "id": 797596,
    "url": "https://api.sofascore.app/api/v1/player/797596/heatmap/overall",
    "file": "assets/heatmaps/797596.png"
  },
  {
    "player": "Pablo Marín",
    "id": 1139409,
    "url": "https://api.sofascore.app/api/v1/player/1139409/heatmap/overall",
    "file": "assets/heatmaps/1139409.png"
  },
  {
    "player": "Guillermo Maripán",
    "id": 339909,
    "url": "https://api.sofascore.app/api/v1/player/339909/heatmap/overall",
    "file": "assets/heatmaps/339909.png"
  },
  {
    "player": "Omar Marmoush",
    "id": 873554,
    "url": "https://api.sofascore.app/api/v1/player/873554/heatmap/overall",
    "file": "assets/heatmaps/873554.png"
  },
  {
    "player": "Tomas Marques",
    "id": 1939137,
    "url": "https://api.sofascore.app/api/v1/player/1939137/heatmap/overall",
    "file": "assets/heatmaps/1939137.png"
  },
  {
    "player": "Marquinhos",
    "id": 155995,
    "url": "https://api.sofascore.app/api/v1/player/155995/heatmap/overall",
    "file": "assets/heatmaps/155995.png"
  },
  {
    "player": "Eric Martel",
    "id": 988639,
    "url": "https://api.sofascore.app/api/v1/player/988639/heatmap/overall",
    "file": "assets/heatmaps/988639.png"
  },
  {
    "player": "Aarón Martín",
    "id": 797286,
    "url": "https://api.sofascore.app/api/v1/player/797286/heatmap/overall",
    "file": "assets/heatmaps/797286.png"
  },
  {
    "player": "Carlos Martín",
    "id": 1131581,
    "url": "https://api.sofascore.app/api/v1/player/1131581/heatmap/overall",
    "file": "assets/heatmaps/1131581.png"
  },
  {
    "player": "Gerard Martín",
    "id": 1094827,
    "url": "https://api.sofascore.app/api/v1/player/1094827/heatmap/overall",
    "file": "assets/heatmaps/1094827.png"
  },
  {
    "player": "Iván Martín",
    "id": 973699,
    "url": "https://api.sofascore.app/api/v1/player/973699/heatmap/overall",
    "file": "assets/heatmaps/973699.png"
  },
  {
    "player": "Jon Martin",
    "id": 1466116,
    "url": "https://api.sofascore.app/api/v1/player/1466116/heatmap/overall",
    "file": "assets/heatmaps/1466116.png"
  },
  {
    "player": "Mario Martín",
    "id": 1154549,
    "url": "https://api.sofascore.app/api/v1/player/1154549/heatmap/overall",
    "file": "assets/heatmaps/1154549.png"
  },
  {
    "player": "Gabriel Martinelli",
    "id": 922573,
    "url": "https://api.sofascore.app/api/v1/player/922573/heatmap/overall",
    "file": "assets/heatmaps/922573.png"
  },
  {
    "player": "Arnau Martinez",
    "id": 1084081,
    "url": "https://api.sofascore.app/api/v1/player/1084081/heatmap/overall",
    "file": "assets/heatmaps/1084081.png"
  },
  {
    "player": "Emiliano Martínez",
    "id": 158263,
    "url": "https://api.sofascore.app/api/v1/player/158263/heatmap/overall",
    "file": "assets/heatmaps/158263.png"
  },
  {
    "player": "Josep Martinez",
    "id": 845291,
    "url": "https://api.sofascore.app/api/v1/player/845291/heatmap/overall",
    "file": "assets/heatmaps/845291.png"
  },
  {
    "player": "Lautaro Martínez",
    "id": 823984,
    "url": "https://api.sofascore.app/api/v1/player/823984/heatmap/overall",
    "file": "assets/heatmaps/823984.png"
  },
  {
    "player": "Lisandro Martínez",
    "id": 859999,
    "url": "https://api.sofascore.app/api/v1/player/859999/heatmap/overall",
    "file": "assets/heatmaps/859999.png"
  },
  {
    "player": "Pablo Martínez",
    "id": 927066,
    "url": "https://api.sofascore.app/api/v1/player/927066/heatmap/overall",
    "file": "assets/heatmaps/927066.png"
  },
  {
    "player": "Toni Martínez",
    "id": 831253,
    "url": "https://api.sofascore.app/api/v1/player/831253/heatmap/overall",
    "file": "assets/heatmaps/831253.png"
  },
  {
    "player": "Adam Marušić",
    "id": 267619,
    "url": "https://api.sofascore.app/api/v1/player/267619/heatmap/overall",
    "file": "assets/heatmaps/267619.png"
  },
  {
    "player": "Omar Mascarell",
    "id": 255999,
    "url": "https://api.sofascore.app/api/v1/player/255999/heatmap/overall",
    "file": "assets/heatmaps/255999.png"
  },
  {
    "player": "Patrizio Masini",
    "id": 970998,
    "url": "https://api.sofascore.app/api/v1/player/970998/heatmap/overall",
    "file": "assets/heatmaps/970998.png"
  },
  {
    "player": "Han-Noah Massengo",
    "id": 927340,
    "url": "https://api.sofascore.app/api/v1/player/927340/heatmap/overall",
    "file": "assets/heatmaps/927340.png"
  },
  {
    "player": "Franco Mastantuono",
    "id": 1403559,
    "url": "https://api.sofascore.app/api/v1/player/1403559/heatmap/overall",
    "file": "assets/heatmaps/1403559.png"
  },
  {
    "player": "Arthur Masuaku",
    "id": 174975,
    "url": "https://api.sofascore.app/api/v1/player/174975/heatmap/overall",
    "file": "assets/heatmaps/174975.png"
  },
  {
    "player": "Clinton Mata",
    "id": 152813,
    "url": "https://api.sofascore.app/api/v1/player/152813/heatmap/overall",
    "file": "assets/heatmaps/152813.png"
  },
  {
    "player": "Igor Matanovic",
    "id": 1019321,
    "url": "https://api.sofascore.app/api/v1/player/1019321/heatmap/overall",
    "file": "assets/heatmaps/1019321.png"
  },
  {
    "player": "Pape Matar Sarr",
    "id": 1002711,
    "url": "https://api.sofascore.app/api/v1/player/1002711/heatmap/overall",
    "file": "assets/heatmaps/1002711.png"
  },
  {
    "player": "Jean-Philippe Mateta",
    "id": 848276,
    "url": "https://api.sofascore.app/api/v1/player/848276/heatmap/overall",
    "file": "assets/heatmaps/848276.png"
  },
  {
    "player": "Nemanja Matić",
    "id": 44241,
    "url": "https://api.sofascore.app/api/v1/player/44241/heatmap/overall",
    "file": "assets/heatmaps/44241.png"
  },
  {
    "player": "Chrislain Matsima",
    "id": 963198,
    "url": "https://api.sofascore.app/api/v1/player/963198/heatmap/overall",
    "file": "assets/heatmaps/963198.png"
  },
  {
    "player": "Jean Mattéo Bahoya",
    "id": 1146148,
    "url": "https://api.sofascore.app/api/v1/player/1146148/heatmap/overall",
    "file": "assets/heatmaps/1146148.png"
  },
  {
    "player": "Alan Matturro",
    "id": 1177401,
    "url": "https://api.sofascore.app/api/v1/player/1177401/heatmap/overall",
    "file": "assets/heatmaps/1177401.png"
  },
  {
    "player": "Neal Maupay",
    "id": 268903,
    "url": "https://api.sofascore.app/api/v1/player/268903/heatmap/overall",
    "file": "assets/heatmaps/268903.png"
  },
  {
    "player": "Konstantinos Mavropanos",
    "id": 829022,
    "url": "https://api.sofascore.app/api/v1/player/829022/heatmap/overall",
    "file": "assets/heatmaps/829022.png"
  },
  {
    "player": "Christian Mawissa",
    "id": 1407848,
    "url": "https://api.sofascore.app/api/v1/player/1407848/heatmap/overall",
    "file": "assets/heatmaps/1407848.png"
  },
  {
    "player": "Eliezer Mayenda",
    "id": 1168588,
    "url": "https://api.sofascore.app/api/v1/player/1168588/heatmap/overall",
    "file": "assets/heatmaps/1168588.png"
  },
  {
    "player": "Ezra Mayers",
    "id": 1652590,
    "url": "https://api.sofascore.app/api/v1/player/1652590/heatmap/overall",
    "file": "assets/heatmaps/1652590.png"
  },
  {
    "player": "Borja Mayoral",
    "id": 604954,
    "url": "https://api.sofascore.app/api/v1/player/604954/heatmap/overall",
    "file": "assets/heatmaps/604954.png"
  },
  {
    "player": "Senny Mayulu",
    "id": 1473491,
    "url": "https://api.sofascore.app/api/v1/player/1473491/heatmap/overall",
    "file": "assets/heatmaps/1473491.png"
  },
  {
    "player": "Ibrahim Maza",
    "id": 1407524,
    "url": "https://api.sofascore.app/api/v1/player/1407524/heatmap/overall",
    "file": "assets/heatmaps/1407524.png"
  },
  {
    "player": "Noussair Mazraoui",
    "id": 847030,
    "url": "https://api.sofascore.app/api/v1/player/847030/heatmap/overall",
    "file": "assets/heatmaps/847030.png"
  },
  {
    "player": "Luca Mazzitelli",
    "id": 369866,
    "url": "https://api.sofascore.app/api/v1/player/369866/heatmap/overall",
    "file": "assets/heatmaps/369866.png"
  },
  {
    "player": "Pasquale Mazzocchi",
    "id": 377512,
    "url": "https://api.sofascore.app/api/v1/player/377512/heatmap/overall",
    "file": "assets/heatmaps/377512.png"
  },
  {
    "player": "Nathan Mbala",
    "id": 2195736,
    "url": "https://api.sofascore.app/api/v1/player/2195736/heatmap/overall",
    "file": "assets/heatmaps/2195736.png"
  },
  {
    "player": "Samuel Mbangula",
    "id": 1100836,
    "url": "https://api.sofascore.app/api/v1/player/1100836/heatmap/overall",
    "file": "assets/heatmaps/1100836.png"
  },
  {
    "player": "Ethan Mbappé",
    "id": 1402698,
    "url": "https://api.sofascore.app/api/v1/player/1402698/heatmap/overall",
    "file": "assets/heatmaps/1402698.png"
  },
  {
    "player": "Kylian Mbappé",
    "id": 826643,
    "url": "https://api.sofascore.app/api/v1/player/826643/heatmap/overall",
    "file": "assets/heatmaps/826643.png"
  },
  {
    "player": "Ibrahim Mbaye",
    "id": 1590918,
    "url": "https://api.sofascore.app/api/v1/player/1590918/heatmap/overall",
    "file": "assets/heatmaps/1590918.png"
  },
  {
    "player": "Chancel Mbemba",
    "id": 238612,
    "url": "https://api.sofascore.app/api/v1/player/238612/heatmap/overall",
    "file": "assets/heatmaps/238612.png"
  },
  {
    "player": "Bryan Mbeumo",
    "id": 927083,
    "url": "https://api.sofascore.app/api/v1/player/927083/heatmap/overall",
    "file": "assets/heatmaps/927083.png"
  },
  {
    "player": "Michel Mboula",
    "id": 1397934,
    "url": "https://api.sofascore.app/api/v1/player/1397934/heatmap/overall",
    "file": "assets/heatmaps/1397934.png"
  },
  {
    "player": "Pathé Mboup",
    "id": 1410231,
    "url": "https://api.sofascore.app/api/v1/player/1410231/heatmap/overall",
    "file": "assets/heatmaps/1410231.png"
  },
  {
    "player": "James Mcatee",
    "id": 1003334,
    "url": "https://api.sofascore.app/api/v1/player/1003334/heatmap/overall",
    "file": "assets/heatmaps/1003334.png"
  },
  {
    "player": "John McGinn",
    "id": 250223,
    "url": "https://api.sofascore.app/api/v1/player/250223/heatmap/overall",
    "file": "assets/heatmaps/250223.png"
  },
  {
    "player": "Weston McKennie",
    "id": 881931,
    "url": "https://api.sofascore.app/api/v1/player/881931/heatmap/overall",
    "file": "assets/heatmaps/881931.png"
  },
  {
    "player": "Mark McKenzie",
    "id": 922759,
    "url": "https://api.sofascore.app/api/v1/player/922759/heatmap/overall",
    "file": "assets/heatmaps/922759.png"
  },
  {
    "player": "Dwight McNeil",
    "id": 935543,
    "url": "https://api.sofascore.app/api/v1/player/935543/heatmap/overall",
    "file": "assets/heatmaps/935543.png"
  },
  {
    "player": "Scott McTominay",
    "id": 879346,
    "url": "https://api.sofascore.app/api/v1/player/879346/heatmap/overall",
    "file": "assets/heatmaps/879346.png"
  },
  {
    "player": "Facundo Medina",
    "id": 860307,
    "url": "https://api.sofascore.app/api/v1/player/860307/heatmap/overall",
    "file": "assets/heatmaps/860307.png"
  },
  {
    "player": "Henrik Meister",
    "id": 1184248,
    "url": "https://api.sofascore.app/api/v1/player/1184248/heatmap/overall",
    "file": "assets/heatmaps/1184248.png"
  },
  {
    "player": "Bamo Meïté",
    "id": 1131541,
    "url": "https://api.sofascore.app/api/v1/player/1131541/heatmap/overall",
    "file": "assets/heatmaps/1131541.png"
  },
  {
    "player": "Hannibal Mejbri",
    "id": 1009386,
    "url": "https://api.sofascore.app/api/v1/player/1009386/heatmap/overall",
    "file": "assets/heatmaps/1009386.png"
  },
  {
    "player": "Nuno Mendes",
    "id": 989768,
    "url": "https://api.sofascore.app/api/v1/player/989768/heatmap/overall",
    "file": "assets/heatmaps/989768.png"
  },
  {
    "player": "Brais Méndez",
    "id": 845385,
    "url": "https://api.sofascore.app/api/v1/player/845385/heatmap/overall",
    "file": "assets/heatmaps/845385.png"
  },
  {
    "player": "Rodrigo Mendoza",
    "id": 1391752,
    "url": "https://api.sofascore.app/api/v1/player/1391752/heatmap/overall",
    "file": "assets/heatmaps/1391752.png"
  },
  {
    "player": "Antoine Mendy",
    "id": 1120615,
    "url": "https://api.sofascore.app/api/v1/player/1120615/heatmap/overall",
    "file": "assets/heatmaps/1120615.png"
  },
  {
    "player": "Batista Mendy",
    "id": 859021,
    "url": "https://api.sofascore.app/api/v1/player/859021/heatmap/overall",
    "file": "assets/heatmaps/859021.png"
  },
  {
    "player": "Ferland Mendy",
    "id": 792073,
    "url": "https://api.sofascore.app/api/v1/player/792073/heatmap/overall",
    "file": "assets/heatmaps/792073.png"
  },
  {
    "player": "Nobel Mendy",
    "id": 1458073,
    "url": "https://api.sofascore.app/api/v1/player/1458073/heatmap/overall",
    "file": "assets/heatmaps/1458073.png"
  },
  {
    "player": "Gideon Mensah",
    "id": 844942,
    "url": "https://api.sofascore.app/api/v1/player/844942/heatmap/overall",
    "file": "assets/heatmaps/844942.png"
  },
  {
    "player": "Khalis Merah",
    "id": 2127096,
    "url": "https://api.sofascore.app/api/v1/player/2127096/heatmap/overall",
    "file": "assets/heatmaps/2127096.png"
  },
  {
    "player": "Alex Meret",
    "id": 592794,
    "url": "https://api.sofascore.app/api/v1/player/592794/heatmap/overall",
    "file": "assets/heatmaps/592794.png"
  },
  {
    "player": "Mikel Merino",
    "id": 592010,
    "url": "https://api.sofascore.app/api/v1/player/592010/heatmap/overall",
    "file": "assets/heatmaps/592010.png"
  },
  {
    "player": "Quentin Merlin",
    "id": 1102502,
    "url": "https://api.sofascore.app/api/v1/player/1102502/heatmap/overall",
    "file": "assets/heatmaps/1102502.png"
  },
  {
    "player": "Rafik Messali",
    "id": 1198264,
    "url": "https://api.sofascore.app/api/v1/player/1198264/heatmap/overall",
    "file": "assets/heatmaps/1198264.png"
  },
  {
    "player": "Junior Messias",
    "id": 888219,
    "url": "https://api.sofascore.app/api/v1/player/888219/heatmap/overall",
    "file": "assets/heatmaps/888219.png"
  },
  {
    "player": "Alejandro Mestanza",
    "id": 1520814,
    "url": "https://api.sofascore.app/api/v1/player/1520814/heatmap/overall",
    "file": "assets/heatmaps/1520814.png"
  },
  {
    "player": "Connor Metcalfe",
    "id": 888854,
    "url": "https://api.sofascore.app/api/v1/player/888854/heatmap/overall",
    "file": "assets/heatmaps/888854.png"
  },
  {
    "player": "Dayann Methalie",
    "id": 1894003,
    "url": "https://api.sofascore.app/api/v1/player/1894003/heatmap/overall",
    "file": "assets/heatmaps/1894003.png"
  },
  {
    "player": "Karol Mets",
    "id": 57627,
    "url": "https://api.sofascore.app/api/v1/player/57627/heatmap/overall",
    "file": "assets/heatmaps/57627.png"
  },
  {
    "player": "Thomas Meunier",
    "id": 128587,
    "url": "https://api.sofascore.app/api/v1/player/128587/heatmap/overall",
    "file": "assets/heatmaps/128587.png"
  },
  {
    "player": "Wisdom Mike",
    "id": 1976732,
    "url": "https://api.sofascore.app/api/v1/player/1976732/heatmap/overall",
    "file": "assets/heatmaps/1976732.png"
  },
  {
    "player": "William Mikelbrencis",
    "id": 1102528,
    "url": "https://api.sofascore.app/api/v1/player/1102528/heatmap/overall",
    "file": "assets/heatmaps/1102528.png"
  },
  {
    "player": "Antoni Milambo",
    "id": 1126692,
    "url": "https://api.sofascore.app/api/v1/player/1126692/heatmap/overall",
    "file": "assets/heatmaps/1126692.png"
  },
  {
    "player": "Nikola Milenković",
    "id": 836168,
    "url": "https://api.sofascore.app/api/v1/player/836168/heatmap/overall",
    "file": "assets/heatmaps/836168.png"
  },
  {
    "player": "Lewis Miley",
    "id": 1400650,
    "url": "https://api.sofascore.app/api/v1/player/1400650/heatmap/overall",
    "file": "assets/heatmaps/1400650.png"
  },
  {
    "player": "Vanja Milinković-Savić",
    "id": 356160,
    "url": "https://api.sofascore.app/api/v1/player/356160/heatmap/overall",
    "file": "assets/heatmaps/356160.png"
  },
  {
    "player": "Éder Militão",
    "id": 822519,
    "url": "https://api.sofascore.app/api/v1/player/822519/heatmap/overall",
    "file": "assets/heatmaps/822519.png"
  },
  {
    "player": "Luis Milla",
    "id": 811629,
    "url": "https://api.sofascore.app/api/v1/player/811629/heatmap/overall",
    "file": "assets/heatmaps/811629.png"
  },
  {
    "player": "Pere Milla",
    "id": 175185,
    "url": "https://api.sofascore.app/api/v1/player/175185/heatmap/overall",
    "file": "assets/heatmaps/175185.png"
  },
  {
    "player": "Lennon Miller",
    "id": 1154894,
    "url": "https://api.sofascore.app/api/v1/player/1154894/heatmap/overall",
    "file": "assets/heatmaps/1154894.png"
  },
  {
    "player": "James Milner",
    "id": 791,
    "url": "https://api.sofascore.app/api/v1/player/791/heatmap/overall",
    "file": "assets/heatmaps/791.png"
  },
  {
    "player": "Veljko Milosavljević",
    "id": 1406130,
    "url": "https://api.sofascore.app/api/v1/player/1406130/heatmap/overall",
    "file": "assets/heatmaps/1406130.png"
  },
  {
    "player": "Jovan Milošević",
    "id": 1154491,
    "url": "https://api.sofascore.app/api/v1/player/1154491/heatmap/overall",
    "file": "assets/heatmaps/1154491.png"
  },
  {
    "player": "Kim Min-jae",
    "id": 896569,
    "url": "https://api.sofascore.app/api/v1/player/896569/heatmap/overall",
    "file": "assets/heatmaps/896569.png"
  },
  {
    "player": "Yerry Mina",
    "id": 360396,
    "url": "https://api.sofascore.app/api/v1/player/360396/heatmap/overall",
    "file": "assets/heatmaps/360396.png"
  },
  {
    "player": "Takumi Minamino",
    "id": 155818,
    "url": "https://api.sofascore.app/api/v1/player/155818/heatmap/overall",
    "file": "assets/heatmaps/155818.png"
  },
  {
    "player": "Tyrone Mings",
    "id": 303638,
    "url": "https://api.sofascore.app/api/v1/player/303638/heatmap/overall",
    "file": "assets/heatmaps/303638.png"
  },
  {
    "player": "Óscar Mingueza",
    "id": 859773,
    "url": "https://api.sofascore.app/api/v1/player/859773/heatmap/overall",
    "file": "assets/heatmaps/859773.png"
  },
  {
    "player": "Yankuba Minteh",
    "id": 1400106,
    "url": "https://api.sofascore.app/api/v1/player/1400106/heatmap/overall",
    "file": "assets/heatmaps/1400106.png"
  },
  {
    "player": "Rafa Mir",
    "id": 825754,
    "url": "https://api.sofascore.app/api/v1/player/825754/heatmap/overall",
    "file": "assets/heatmaps/825754.png"
  },
  {
    "player": "Juan Miranda",
    "id": 855829,
    "url": "https://api.sofascore.app/api/v1/player/855829/heatmap/overall",
    "file": "assets/heatmaps/855829.png"
  },
  {
    "player": "Fabio Miretti",
    "id": 1010223,
    "url": "https://api.sofascore.app/api/v1/player/1010223/heatmap/overall",
    "file": "assets/heatmaps/1010223.png"
  },
  {
    "player": "Tyrick Mitchell",
    "id": 988275,
    "url": "https://api.sofascore.app/api/v1/player/988275/heatmap/overall",
    "file": "assets/heatmaps/988275.png"
  },
  {
    "player": "Kaoru Mitoma",
    "id": 936849,
    "url": "https://api.sofascore.app/api/v1/player/936849/heatmap/overall",
    "file": "assets/heatmaps/936849.png"
  },
  {
    "player": "Maximilian Mittelstädt",
    "id": 788949,
    "url": "https://api.sofascore.app/api/v1/player/788949/heatmap/overall",
    "file": "assets/heatmaps/788949.png"
  },
  {
    "player": "Henrikh Mkhitaryan",
    "id": 37151,
    "url": "https://api.sofascore.app/api/v1/player/37151/heatmap/overall",
    "file": "assets/heatmaps/37151.png"
  },
  {
    "player": "Branimir Mlacic",
    "id": 1831525,
    "url": "https://api.sofascore.app/api/v1/player/1831525/heatmap/overall",
    "file": "assets/heatmaps/1831525.png"
  },
  {
    "player": "Luka Modrić",
    "id": 15466,
    "url": "https://api.sofascore.app/api/v1/player/15466/heatmap/overall",
    "file": "assets/heatmaps/15466.png"
  },
  {
    "player": "Mostafa Mohamed",
    "id": 873551,
    "url": "https://api.sofascore.app/api/v1/player/873551/heatmap/overall",
    "file": "assets/heatmaps/873551.png"
  },
  {
    "player": "Wael Mohya",
    "id": 1995809,
    "url": "https://api.sofascore.app/api/v1/player/1995809/heatmap/overall",
    "file": "assets/heatmaps/1995809.png"
  },
  {
    "player": "Johan Mojica",
    "id": 344847,
    "url": "https://api.sofascore.app/api/v1/player/344847/heatmap/overall",
    "file": "assets/heatmaps/344847.png"
  },
  {
    "player": "Alberto Moleiro",
    "id": 1012444,
    "url": "https://api.sofascore.app/api/v1/player/1012444/heatmap/overall",
    "file": "assets/heatmaps/1012444.png"
  },
  {
    "player": "Nahuel Molina",
    "id": 831799,
    "url": "https://api.sofascore.app/api/v1/player/831799/heatmap/overall",
    "file": "assets/heatmaps/831799.png"
  },
  {
    "player": "Jon Moncayola",
    "id": 976141,
    "url": "https://api.sofascore.app/api/v1/player/976141/heatmap/overall",
    "file": "assets/heatmaps/976141.png"
  },
  {
    "player": "Jano Monserrate",
    "id": 1832286,
    "url": "https://api.sofascore.app/api/v1/player/1832286/heatmap/overall",
    "file": "assets/heatmaps/1832286.png"
  },
  {
    "player": "Jorge Montes",
    "id": 1895197,
    "url": "https://api.sofascore.app/api/v1/player/1895197/heatmap/overall",
    "file": "assets/heatmaps/1895197.png"
  },
  {
    "player": "Lorenzo Montipò",
    "id": 253391,
    "url": "https://api.sofascore.app/api/v1/player/253391/heatmap/overall",
    "file": "assets/heatmaps/253391.png"
  },
  {
    "player": "Álvaro Morata",
    "id": 125407,
    "url": "https://api.sofascore.app/api/v1/player/125407/heatmap/overall",
    "file": "assets/heatmaps/125407.png"
  },
  {
    "player": "Morato",
    "id": 985086,
    "url": "https://api.sofascore.app/api/v1/player/985086/heatmap/overall",
    "file": "assets/heatmaps/985086.png"
  },
  {
    "player": "Diego Morcillo",
    "id": 1430809,
    "url": "https://api.sofascore.app/api/v1/player/1430809/heatmap/overall",
    "file": "assets/heatmaps/1430809.png"
  },
  {
    "player": "Afonso Moreira",
    "id": 1215906,
    "url": "https://api.sofascore.app/api/v1/player/1215906/heatmap/overall",
    "file": "assets/heatmaps/1215906.png"
  },
  {
    "player": "Diego Moreira",
    "id": 1142233,
    "url": "https://api.sofascore.app/api/v1/player/1142233/heatmap/overall",
    "file": "assets/heatmaps/1142233.png"
  },
  {
    "player": "Alberto Moreno",
    "id": 229740,
    "url": "https://api.sofascore.app/api/v1/player/229740/heatmap/overall",
    "file": "assets/heatmaps/229740.png"
  },
  {
    "player": "Álex Moreno",
    "id": 294593,
    "url": "https://api.sofascore.app/api/v1/player/294593/heatmap/overall",
    "file": "assets/heatmaps/294593.png"
  },
  {
    "player": "Fabio Moreno Fell",
    "id": 1065051,
    "url": "https://api.sofascore.app/api/v1/player/1065051/heatmap/overall",
    "file": "assets/heatmaps/1065051.png"
  },
  {
    "player": "Gerard Moreno",
    "id": 146866,
    "url": "https://api.sofascore.app/api/v1/player/146866/heatmap/overall",
    "file": "assets/heatmaps/146866.png"
  },
  {
    "player": "Matias Moreno",
    "id": 1496360,
    "url": "https://api.sofascore.app/api/v1/player/1496360/heatmap/overall",
    "file": "assets/heatmaps/1496360.png"
  },
  {
    "player": "Stefano Moreo",
    "id": 346948,
    "url": "https://api.sofascore.app/api/v1/player/346948/heatmap/overall",
    "file": "assets/heatmaps/346948.png"
  },
  {
    "player": "Mateu Morey",
    "id": 879543,
    "url": "https://api.sofascore.app/api/v1/player/879543/heatmap/overall",
    "file": "assets/heatmaps/879543.png"
  },
  {
    "player": "Ilaix Moriba",
    "id": 962890,
    "url": "https://api.sofascore.app/api/v1/player/962890/heatmap/overall",
    "file": "assets/heatmaps/962890.png"
  },
  {
    "player": "Manu Morlanes",
    "id": 826004,
    "url": "https://api.sofascore.app/api/v1/player/826004/heatmap/overall",
    "file": "assets/heatmaps/826004.png"
  },
  {
    "player": "Luca Moro",
    "id": 949780,
    "url": "https://api.sofascore.app/api/v1/player/949780/heatmap/overall",
    "file": "assets/heatmaps/949780.png"
  },
  {
    "player": "Nikola Moro",
    "id": 814882,
    "url": "https://api.sofascore.app/api/v1/player/814882/heatmap/overall",
    "file": "assets/heatmaps/814882.png"
  },
  {
    "player": "Raúl Moro",
    "id": 980383,
    "url": "https://api.sofascore.app/api/v1/player/980383/heatmap/overall",
    "file": "assets/heatmaps/980383.png"
  },
  {
    "player": "Tyler Morton",
    "id": 979118,
    "url": "https://api.sofascore.app/api/v1/player/979118/heatmap/overall",
    "file": "assets/heatmaps/979118.png"
  },
  {
    "player": "Daren Mosengo",
    "id": 1895829,
    "url": "https://api.sofascore.app/api/v1/player/1895829/heatmap/overall",
    "file": "assets/heatmaps/1895829.png"
  },
  {
    "player": "Cristhian Mosquera",
    "id": 1144630,
    "url": "https://api.sofascore.app/api/v1/player/1144630/heatmap/overall",
    "file": "assets/heatmaps/1144630.png"
  },
  {
    "player": "Daniel Mosquera",
    "id": 1018179,
    "url": "https://api.sofascore.app/api/v1/player/1018179/heatmap/overall",
    "file": "assets/heatmaps/1018179.png"
  },
  {
    "player": "Yerson Mosquera",
    "id": 1014835,
    "url": "https://api.sofascore.app/api/v1/player/1014835/heatmap/overall",
    "file": "assets/heatmaps/1014835.png"
  },
  {
    "player": "Edoardo Motta",
    "id": 1518983,
    "url": "https://api.sofascore.app/api/v1/player/1518983/heatmap/overall",
    "file": "assets/heatmaps/1518983.png"
  },
  {
    "player": "Mason Mount",
    "id": 836694,
    "url": "https://api.sofascore.app/api/v1/player/836694/heatmap/overall",
    "file": "assets/heatmaps/836694.png"
  },
  {
    "player": "Samir El Mourabet",
    "id": 1605921,
    "url": "https://api.sofascore.app/api/v1/player/1605921/heatmap/overall",
    "file": "assets/heatmaps/1605921.png"
  },
  {
    "player": "Santiago Mouriño",
    "id": 1468046,
    "url": "https://api.sofascore.app/api/v1/player/1468046/heatmap/overall",
    "file": "assets/heatmaps/1468046.png"
  },
  {
    "player": "Louis Mouton",
    "id": 1172936,
    "url": "https://api.sofascore.app/api/v1/player/1172936/heatmap/overall",
    "file": "assets/heatmaps/1172936.png"
  },
  {
    "player": "Lionel Mpasi",
    "id": 599192,
    "url": "https://api.sofascore.app/api/v1/player/599192/heatmap/overall",
    "file": "assets/heatmaps/599192.png"
  },
  {
    "player": "Tarik Muharemovic",
    "id": 1118177,
    "url": "https://api.sofascore.app/api/v1/player/1118177/heatmap/overall",
    "file": "assets/heatmaps/1118177.png"
  },
  {
    "player": "Miro Muheim",
    "id": 798303,
    "url": "https://api.sofascore.app/api/v1/player/798303/heatmap/overall",
    "file": "assets/heatmaps/798303.png"
  },
  {
    "player": "Ngal'Ayel Mukau",
    "id": 1391541,
    "url": "https://api.sofascore.app/api/v1/player/1391541/heatmap/overall",
    "file": "assets/heatmaps/1391541.png"
  },
  {
    "player": "Nordan Mukiele",
    "id": 1891021,
    "url": "https://api.sofascore.app/api/v1/player/1891021/heatmap/overall",
    "file": "assets/heatmaps/1891021.png"
  },
  {
    "player": "Nordi Mukiele",
    "id": 780014,
    "url": "https://api.sofascore.app/api/v1/player/780014/heatmap/overall",
    "file": "assets/heatmaps/780014.png"
  },
  {
    "player": "Romaine Mundle",
    "id": 1094440,
    "url": "https://api.sofascore.app/api/v1/player/1094440/heatmap/overall",
    "file": "assets/heatmaps/1094440.png"
  },
  {
    "player": "Rodrigo Muniz",
    "id": 1015256,
    "url": "https://api.sofascore.app/api/v1/player/1015256/heatmap/overall",
    "file": "assets/heatmaps/1015256.png"
  },
  {
    "player": "Believe Munongo",
    "id": 2076689,
    "url": "https://api.sofascore.app/api/v1/player/2076689/heatmap/overall",
    "file": "assets/heatmaps/2076689.png"
  },
  {
    "player": "Aihen Muñoz",
    "id": 966441,
    "url": "https://api.sofascore.app/api/v1/player/966441/heatmap/overall",
    "file": "assets/heatmaps/966441.png"
  },
  {
    "player": "Daniel Muñoz",
    "id": 870360,
    "url": "https://api.sofascore.app/api/v1/player/870360/heatmap/overall",
    "file": "assets/heatmaps/870360.png"
  },
  {
    "player": "Iker Muñoz",
    "id": 1119586,
    "url": "https://api.sofascore.app/api/v1/player/1119586/heatmap/overall",
    "file": "assets/heatmaps/1119586.png"
  },
  {
    "player": "Javier Muñoz",
    "id": 353154,
    "url": "https://api.sofascore.app/api/v1/player/353154/heatmap/overall",
    "file": "assets/heatmaps/353154.png"
  },
  {
    "player": "Víctor Muñoz",
    "id": 1145642,
    "url": "https://api.sofascore.app/api/v1/player/1145642/heatmap/overall",
    "file": "assets/heatmaps/1145642.png"
  },
  {
    "player": "Arijanet Muric",
    "id": 888971,
    "url": "https://api.sofascore.app/api/v1/player/888971/heatmap/overall",
    "file": "assets/heatmaps/888971.png"
  },
  {
    "player": "Murillo",
    "id": 1199282,
    "url": "https://api.sofascore.app/api/v1/player/1199282/heatmap/overall",
    "file": "assets/heatmaps/1199282.png"
  },
  {
    "player": "Vedat Muriqi",
    "id": 310874,
    "url": "https://api.sofascore.app/api/v1/player/310874/heatmap/overall",
    "file": "assets/heatmaps/310874.png"
  },
  {
    "player": "Alex Murphy",
    "id": 1125214,
    "url": "https://api.sofascore.app/api/v1/player/1125214/heatmap/overall",
    "file": "assets/heatmaps/1125214.png"
  },
  {
    "player": "Jacob Murphy",
    "id": 372336,
    "url": "https://api.sofascore.app/api/v1/player/372336/heatmap/overall",
    "file": "assets/heatmaps/372336.png"
  },
  {
    "player": "Salim Musah",
    "id": 1864786,
    "url": "https://api.sofascore.app/api/v1/player/1864786/heatmap/overall",
    "file": "assets/heatmaps/1864786.png"
  },
  {
    "player": "Jamal Musiala",
    "id": 1010231,
    "url": "https://api.sofascore.app/api/v1/player/1010231/heatmap/overall",
    "file": "assets/heatmaps/1010231.png"
  },
  {
    "player": "Juan Musso",
    "id": 263651,
    "url": "https://api.sofascore.app/api/v1/player/263651/heatmap/overall",
    "file": "assets/heatmaps/263651.png"
  },
  {
    "player": "Yvon Mvogo",
    "id": 149656,
    "url": "https://api.sofascore.app/api/v1/player/149656/heatmap/overall",
    "file": "assets/heatmaps/149656.png"
  },
  {
    "player": "Phillipp Mwene",
    "id": 138126,
    "url": "https://api.sofascore.app/api/v1/player/138126/heatmap/overall",
    "file": "assets/heatmaps/138126.png"
  },
  {
    "player": "Vitaliy Mykolenko",
    "id": 876643,
    "url": "https://api.sofascore.app/api/v1/player/876643/heatmap/overall",
    "file": "assets/heatmaps/876643.png"
  },
  {
    "player": "Joakim Mæhle",
    "id": 842364,
    "url": "https://api.sofascore.app/api/v1/player/842364/heatmap/overall",
    "file": "assets/heatmaps/842364.png"
  },
  {
    "player": "David Møller Wolfe",
    "id": 1031283,
    "url": "https://api.sofascore.app/api/v1/player/1031283/heatmap/overall",
    "file": "assets/heatmaps/1031283.png"
  },
  {
    "player": "Konan N'dri",
    "id": 978327,
    "url": "https://api.sofascore.app/api/v1/player/978327/heatmap/overall",
    "file": "assets/heatmaps/978327.png"
  },
  {
    "player": "Stanley N'Soki",
    "id": 904991,
    "url": "https://api.sofascore.app/api/v1/player/904991/heatmap/overall",
    "file": "assets/heatmaps/904991.png"
  },
  {
    "player": "Bilal Nadir",
    "id": 1129527,
    "url": "https://api.sofascore.app/api/v1/player/1129527/heatmap/overall",
    "file": "assets/heatmaps/1129527.png"
  },
  {
    "player": "Mahamadou Nagida",
    "id": 1545409,
    "url": "https://api.sofascore.app/api/v1/player/1545409/heatmap/overall",
    "file": "assets/heatmaps/1545409.png"
  },
  {
    "player": "Sebastian Nanasi",
    "id": 962068,
    "url": "https://api.sofascore.app/api/v1/player/962068/heatmap/overall",
    "file": "assets/heatmaps/962068.png"
  },
  {
    "player": "Nikolas Nartey",
    "id": 861981,
    "url": "https://api.sofascore.app/api/v1/player/861981/heatmap/overall",
    "file": "assets/heatmaps/861981.png"
  },
  {
    "player": "Noah Nartey",
    "id": 1195782,
    "url": "https://api.sofascore.app/api/v1/player/1195782/heatmap/overall",
    "file": "assets/heatmaps/1195782.png"
  },
  {
    "player": "Natan",
    "id": 1015287,
    "url": "https://api.sofascore.app/api/v1/player/1015287/heatmap/overall",
    "file": "assets/heatmaps/1015287.png"
  },
  {
    "player": "Pau Navarro",
    "id": 1525863,
    "url": "https://api.sofascore.app/api/v1/player/1525863/heatmap/overall",
    "file": "assets/heatmaps/1525863.png"
  },
  {
    "player": "Roberto Navarro",
    "id": 944165,
    "url": "https://api.sofascore.app/api/v1/player/944165/heatmap/overall",
    "file": "assets/heatmaps/944165.png"
  },
  {
    "player": "Corrie Ndaba",
    "id": 981470,
    "url": "https://api.sofascore.app/api/v1/player/981470/heatmap/overall",
    "file": "assets/heatmaps/981470.png"
  },
  {
    "player": "Michel Ndary Adopo",
    "id": 928777,
    "url": "https://api.sofascore.app/api/v1/player/928777/heatmap/overall",
    "file": "assets/heatmaps/928777.png"
  },
  {
    "player": "Youssouf Ndayishimiye",
    "id": 985934,
    "url": "https://api.sofascore.app/api/v1/player/985934/heatmap/overall",
    "file": "assets/heatmaps/985934.png"
  },
  {
    "player": "Iliman Ndiaye",
    "id": 914309,
    "url": "https://api.sofascore.app/api/v1/player/914309/heatmap/overall",
    "file": "assets/heatmaps/914309.png"
  },
  {
    "player": "Rassoul Ndiaye",
    "id": 992026,
    "url": "https://api.sofascore.app/api/v1/player/992026/heatmap/overall",
    "file": "assets/heatmaps/992026.png"
  },
  {
    "player": "Tanguy Ndombele",
    "id": 845486,
    "url": "https://api.sofascore.app/api/v1/player/845486/heatmap/overall",
    "file": "assets/heatmaps/845486.png"
  },
  {
    "player": "Cher Ndour",
    "id": 1114422,
    "url": "https://api.sofascore.app/api/v1/player/1114422/heatmap/overall",
    "file": "assets/heatmaps/1114422.png"
  },
  {
    "player": "Dan Ndoye",
    "id": 944327,
    "url": "https://api.sofascore.app/api/v1/player/944327/heatmap/overall",
    "file": "assets/heatmaps/944327.png"
  },
  {
    "player": "Paul Nebel",
    "id": 980621,
    "url": "https://api.sofascore.app/api/v1/player/980621/heatmap/overall",
    "file": "assets/heatmaps/980621.png"
  },
  {
    "player": "Kosta Nedeljković",
    "id": 1152923,
    "url": "https://api.sofascore.app/api/v1/player/1152923/heatmap/overall",
    "file": "assets/heatmaps/1152923.png"
  },
  {
    "player": "Loïc Nego",
    "id": 54308,
    "url": "https://api.sofascore.app/api/v1/player/54308/heatmap/overall",
    "file": "assets/heatmaps/54308.png"
  },
  {
    "player": "Reiss Nelson",
    "id": 826139,
    "url": "https://api.sofascore.app/api/v1/player/826139/heatmap/overall",
    "file": "assets/heatmaps/826139.png"
  },
  {
    "player": "Victor Nelsson",
    "id": 846148,
    "url": "https://api.sofascore.app/api/v1/player/846148/heatmap/overall",
    "file": "assets/heatmaps/846148.png"
  },
  {
    "player": "David Neres",
    "id": 850993,
    "url": "https://api.sofascore.app/api/v1/player/850993/heatmap/overall",
    "file": "assets/heatmaps/850993.png"
  },
  {
    "player": "Martim Neto",
    "id": 1100646,
    "url": "https://api.sofascore.app/api/v1/player/1100646/heatmap/overall",
    "file": "assets/heatmaps/1100646.png"
  },
  {
    "player": "Pedro Neto",
    "id": 879349,
    "url": "https://api.sofascore.app/api/v1/player/879349/heatmap/overall",
    "file": "assets/heatmaps/879349.png"
  },
  {
    "player": "Luca Netz",
    "id": 979144,
    "url": "https://api.sofascore.app/api/v1/player/979144/heatmap/overall",
    "file": "assets/heatmaps/979144.png"
  },
  {
    "player": "Manuel Neuer",
    "id": 8959,
    "url": "https://api.sofascore.app/api/v1/player/8959/heatmap/overall",
    "file": "assets/heatmaps/8959.png"
  },
  {
    "player": "Florian Neuhaus",
    "id": 837205,
    "url": "https://api.sofascore.app/api/v1/player/837205/heatmap/overall",
    "file": "assets/heatmaps/837205.png"
  },
  {
    "player": "Cenny Neumann",
    "id": 1823913,
    "url": "https://api.sofascore.app/api/v1/player/1823913/heatmap/overall",
    "file": "assets/heatmaps/1823913.png"
  },
  {
    "player": "João Neves",
    "id": 1190933,
    "url": "https://api.sofascore.app/api/v1/player/1190933/heatmap/overall",
    "file": "assets/heatmaps/1190933.png"
  },
  {
    "player": "Oumar Ngom",
    "id": 1175854,
    "url": "https://api.sofascore.app/api/v1/player/1175854/heatmap/overall",
    "file": "assets/heatmaps/1175854.png"
  },
  {
    "player": "Cyril Ngonge",
    "id": 877037,
    "url": "https://api.sofascore.app/api/v1/player/877037/heatmap/overall",
    "file": "assets/heatmaps/877037.png"
  },
  {
    "player": "Nathan Ngoy",
    "id": 1119487,
    "url": "https://api.sofascore.app/api/v1/player/1119487/heatmap/overall",
    "file": "assets/heatmaps/1119487.png"
  },
  {
    "player": "Rio Ngumoha",
    "id": 1881902,
    "url": "https://api.sofascore.app/api/v1/player/1881902/heatmap/overall",
    "file": "assets/heatmaps/1881902.png"
  },
  {
    "player": "Moussa Niakhate",
    "id": 758168,
    "url": "https://api.sofascore.app/api/v1/player/758168/heatmap/overall",
    "file": "assets/heatmaps/758168.png"
  },
  {
    "player": "Abdoulaye Niakhate Ndiaye",
    "id": 984527,
    "url": "https://api.sofascore.app/api/v1/player/984527/heatmap/overall",
    "file": "assets/heatmaps/984527.png"
  },
  {
    "player": "Youssoupha Niang",
    "id": 2197599,
    "url": "https://api.sofascore.app/api/v1/player/2197599/heatmap/overall",
    "file": "assets/heatmaps/2197599.png"
  },
  {
    "player": "Tanguy Nianzou",
    "id": 1003007,
    "url": "https://api.sofascore.app/api/v1/player/1003007/heatmap/overall",
    "file": "assets/heatmaps/1003007.png"
  },
  {
    "player": "Cheikh Niasse",
    "id": 972523,
    "url": "https://api.sofascore.app/api/v1/player/972523/heatmap/overall",
    "file": "assets/heatmaps/972523.png"
  },
  {
    "player": "Samuel Nibombé",
    "id": 1566349,
    "url": "https://api.sofascore.app/api/v1/player/1566349/heatmap/overall",
    "file": "assets/heatmaps/1566349.png"
  },
  {
    "player": "Rasmus Nicolaisen",
    "id": 798124,
    "url": "https://api.sofascore.app/api/v1/player/798124/heatmap/overall",
    "file": "assets/heatmaps/798124.png"
  },
  {
    "player": "Moritz Nicolas",
    "id": 578166,
    "url": "https://api.sofascore.app/api/v1/player/578166/heatmap/overall",
    "file": "assets/heatmaps/578166.png"
  },
  {
    "player": "Hans Nicolussi Caviglia",
    "id": 876259,
    "url": "https://api.sofascore.app/api/v1/player/876259/heatmap/overall",
    "file": "assets/heatmaps/876259.png"
  },
  {
    "player": "Julian Niehues",
    "id": 1066042,
    "url": "https://api.sofascore.app/api/v1/player/1066042/heatmap/overall",
    "file": "assets/heatmaps/1066042.png"
  },
  {
    "player": "Alieu Njie",
    "id": 1493157,
    "url": "https://api.sofascore.app/api/v1/player/1493157/heatmap/overall",
    "file": "assets/heatmaps/1493157.png"
  },
  {
    "player": "Justin Njinmah",
    "id": 1005343,
    "url": "https://api.sofascore.app/api/v1/player/1005343/heatmap/overall",
    "file": "assets/heatmaps/1005343.png"
  },
  {
    "player": "Niels Nkounkou",
    "id": 941179,
    "url": "https://api.sofascore.app/api/v1/player/941179/heatmap/overall",
    "file": "assets/heatmaps/941179.png"
  },
  {
    "player": "Christopher Nkunku",
    "id": 769333,
    "url": "https://api.sofascore.app/api/v1/player/769333/heatmap/overall",
    "file": "assets/heatmaps/769333.png"
  },
  {
    "player": "Felix Nmecha",
    "id": 907463,
    "url": "https://api.sofascore.app/api/v1/player/907463/heatmap/overall",
    "file": "assets/heatmaps/907463.png"
  },
  {
    "player": "Lukas Nmecha",
    "id": 803185,
    "url": "https://api.sofascore.app/api/v1/player/803185/heatmap/overall",
    "file": "assets/heatmaps/803185.png"
  },
  {
    "player": "Tochukwu Nnadi",
    "id": 1191892,
    "url": "https://api.sofascore.app/api/v1/player/1191892/heatmap/overall",
    "file": "assets/heatmaps/1191892.png"
  },
  {
    "player": "Martin Nogoto Bley",
    "id": 2266256,
    "url": "https://api.sofascore.app/api/v1/player/2266256/heatmap/overall",
    "file": "assets/heatmaps/2266256.png"
  },
  {
    "player": "Arnaud Nordin",
    "id": 848458,
    "url": "https://api.sofascore.app/api/v1/player/848458/heatmap/overall",
    "file": "assets/heatmaps/848458.png"
  },
  {
    "player": "Brooke Norton-Cuffy",
    "id": 1087514,
    "url": "https://api.sofascore.app/api/v1/player/1087514/heatmap/overall",
    "file": "assets/heatmaps/1087514.png"
  },
  {
    "player": "Tijjani Noslin",
    "id": 1069244,
    "url": "https://api.sofascore.app/api/v1/player/1069244/heatmap/overall",
    "file": "assets/heatmaps/1069244.png"
  },
  {
    "player": "Noah Nsoki",
    "id": 1937806,
    "url": "https://api.sofascore.app/api/v1/player/1937806/heatmap/overall",
    "file": "assets/heatmaps/1937806.png"
  },
  {
    "player": "Randy Nteka",
    "id": 932764,
    "url": "https://api.sofascore.app/api/v1/player/932764/heatmap/overall",
    "file": "assets/heatmaps/932764.png"
  },
  {
    "player": "Alexander Nübel",
    "id": 584722,
    "url": "https://api.sofascore.app/api/v1/player/584722/heatmap/overall",
    "file": "assets/heatmaps/584722.png"
  },
  {
    "player": "Matheus Nunes",
    "id": 945122,
    "url": "https://api.sofascore.app/api/v1/player/945122/heatmap/overall",
    "file": "assets/heatmaps/945122.png"
  },
  {
    "player": "Álvaro Núñez",
    "id": 1012410,
    "url": "https://api.sofascore.app/api/v1/player/1012410/heatmap/overall",
    "file": "assets/heatmaps/1012410.png"
  },
  {
    "player": "Unai Núñez",
    "id": 892521,
    "url": "https://api.sofascore.app/api/v1/player/892521/heatmap/overall",
    "file": "assets/heatmaps/892521.png"
  },
  {
    "player": "Joi Nuredini",
    "id": 1605324,
    "url": "https://api.sofascore.app/api/v1/player/1605324/heatmap/overall",
    "file": "assets/heatmaps/1605324.png"
  },
  {
    "player": "Antonio Nusa",
    "id": 1121923,
    "url": "https://api.sofascore.app/api/v1/player/1121923/heatmap/overall",
    "file": "assets/heatmaps/1121923.png"
  },
  {
    "player": "Ethan Nwaneri",
    "id": 1401702,
    "url": "https://api.sofascore.app/api/v1/player/1401702/heatmap/overall",
    "file": "assets/heatmaps/1401702.png"
  },
  {
    "player": "Ørjan Nyland",
    "id": 22209,
    "url": "https://api.sofascore.app/api/v1/player/22209/heatmap/overall",
    "file": "assets/heatmaps/22209.png"
  },
  {
    "player": "Allan Nyom",
    "id": 128637,
    "url": "https://api.sofascore.app/api/v1/player/128637/heatmap/overall",
    "file": "assets/heatmaps/128637.png"
  },
  {
    "player": "Trey Nyoni",
    "id": 1445945,
    "url": "https://api.sofascore.app/api/v1/player/1445945/heatmap/overall",
    "file": "assets/heatmaps/1445945.png"
  },
  {
    "player": "M'Bala Nzola",
    "id": 788061,
    "url": "https://api.sofascore.app/api/v1/player/788061/heatmap/overall",
    "file": "assets/heatmaps/788061.png"
  },
  {
    "player": "Christian Nørgaard",
    "id": 135256,
    "url": "https://api.sofascore.app/api/v1/player/135256/heatmap/overall",
    "file": "assets/heatmaps/135256.png"
  },
  {
    "player": "Jake O'Brien",
    "id": 998253,
    "url": "https://api.sofascore.app/api/v1/player/998253/heatmap/overall",
    "file": "assets/heatmaps/998253.png"
  },
  {
    "player": "Luke O'Nien",
    "id": 365812,
    "url": "https://api.sofascore.app/api/v1/player/365812/heatmap/overall",
    "file": "assets/heatmaps/365812.png"
  },
  {
    "player": "Matt O'Riley",
    "id": 891829,
    "url": "https://api.sofascore.app/api/v1/player/891829/heatmap/overall",
    "file": "assets/heatmaps/891829.png"
  },
  {
    "player": "Adam Obert",
    "id": 964153,
    "url": "https://api.sofascore.app/api/v1/player/964153/heatmap/overall",
    "file": "assets/heatmaps/964153.png"
  },
  {
    "player": "Jan Oblak",
    "id": 69768,
    "url": "https://api.sofascore.app/api/v1/player/69768/heatmap/overall",
    "file": "assets/heatmaps/69768.png"
  },
  {
    "player": "Noam Obougou Jacquet",
    "id": 1895833,
    "url": "https://api.sofascore.app/api/v1/player/1895833/heatmap/overall",
    "file": "assets/heatmaps/1895833.png"
  },
  {
    "player": "Rafel Obrador",
    "id": 1142692,
    "url": "https://api.sofascore.app/api/v1/player/1142692/heatmap/overall",
    "file": "assets/heatmaps/1142692.png"
  },
  {
    "player": "Job Ochieng'",
    "id": 1111081,
    "url": "https://api.sofascore.app/api/v1/player/1111081/heatmap/overall",
    "file": "assets/heatmaps/1111081.png"
  },
  {
    "player": "Jens Odgaard",
    "id": 826064,
    "url": "https://api.sofascore.app/api/v1/player/826064/heatmap/overall",
    "file": "assets/heatmaps/826064.png"
  },
  {
    "player": "Wilson Odobert",
    "id": 1142679,
    "url": "https://api.sofascore.app/api/v1/player/1142679/heatmap/overall",
    "file": "assets/heatmaps/1142679.png"
  },
  {
    "player": "David Odogu",
    "id": 1424191,
    "url": "https://api.sofascore.app/api/v1/player/1424191/heatmap/overall",
    "file": "assets/heatmaps/1424191.png"
  },
  {
    "player": "Álvaro Odriozola",
    "id": 353250,
    "url": "https://api.sofascore.app/api/v1/player/353250/heatmap/overall",
    "file": "assets/heatmaps/353250.png"
  },
  {
    "player": "Tim Oermann",
    "id": 1138778,
    "url": "https://api.sofascore.app/api/v1/player/1138778/heatmap/overall",
    "file": "assets/heatmaps/1138778.png"
  },
  {
    "player": "Uchenna Ogundu",
    "id": 1996846,
    "url": "https://api.sofascore.app/api/v1/player/1996846/heatmap/overall",
    "file": "assets/heatmaps/1996846.png"
  },
  {
    "player": "Noah Okafor",
    "id": 865523,
    "url": "https://api.sofascore.app/api/v1/player/865523/heatmap/overall",
    "file": "assets/heatmaps/865523.png"
  },
  {
    "player": "David Okereke",
    "id": 831290,
    "url": "https://api.sofascore.app/api/v1/player/831290/heatmap/overall",
    "file": "assets/heatmaps/831290.png"
  },
  {
    "player": "Bryan Okoh",
    "id": 987491,
    "url": "https://api.sofascore.app/api/v1/player/987491/heatmap/overall",
    "file": "assets/heatmaps/987491.png"
  },
  {
    "player": "Maduka Okoye",
    "id": 891656,
    "url": "https://api.sofascore.app/api/v1/player/891656/heatmap/overall",
    "file": "assets/heatmaps/891656.png"
  },
  {
    "player": "Olasagasti",
    "id": 1010383,
    "url": "https://api.sofascore.app/api/v1/player/1010383/heatmap/overall",
    "file": "assets/heatmaps/1010383.png"
  },
  {
    "player": "Michael Olise",
    "id": 978838,
    "url": "https://api.sofascore.app/api/v1/player/978838/heatmap/overall",
    "file": "assets/heatmaps/978838.png"
  },
  {
    "player": "Mathías Olivera",
    "id": 805078,
    "url": "https://api.sofascore.app/api/v1/player/805078/heatmap/overall",
    "file": "assets/heatmaps/805078.png"
  },
  {
    "player": "Dani Olmo",
    "id": 789071,
    "url": "https://api.sofascore.app/api/v1/player/789071/heatmap/overall",
    "file": "assets/heatmaps/789071.png"
  },
  {
    "player": "Callum Olusesi",
    "id": 1403190,
    "url": "https://api.sofascore.app/api/v1/player/1403190/heatmap/overall",
    "file": "assets/heatmaps/1403190.png"
  },
  {
    "player": "Tani Oluwaseyi",
    "id": 1172477,
    "url": "https://api.sofascore.app/api/v1/player/1172477/heatmap/overall",
    "file": "assets/heatmaps/1172477.png"
  },
  {
    "player": "Warmed Omari",
    "id": 999030,
    "url": "https://api.sofascore.app/api/v1/player/999030/heatmap/overall",
    "file": "assets/heatmaps/999030.png"
  },
  {
    "player": "Andrew Omobamidele",
    "id": 983066,
    "url": "https://api.sofascore.app/api/v1/player/983066/heatmap/overall",
    "file": "assets/heatmaps/983066.png"
  },
  {
    "player": "Amadou Onana",
    "id": 923973,
    "url": "https://api.sofascore.app/api/v1/player/923973/heatmap/overall",
    "file": "assets/heatmaps/923973.png"
  },
  {
    "player": "Jean Onana",
    "id": 978301,
    "url": "https://api.sofascore.app/api/v1/player/978301/heatmap/overall",
    "file": "assets/heatmaps/978301.png"
  },
  {
    "player": "Jacob Ondrejka",
    "id": 1004790,
    "url": "https://api.sofascore.app/api/v1/player/1004790/heatmap/overall",
    "file": "assets/heatmaps/1004790.png"
  },
  {
    "player": "Loïs Openda",
    "id": 835480,
    "url": "https://api.sofascore.app/api/v1/player/835480/heatmap/overall",
    "file": "assets/heatmaps/835480.png"
  },
  {
    "player": "Fredrik Oppegard",
    "id": 1005648,
    "url": "https://api.sofascore.app/api/v1/player/1005648/heatmap/overall",
    "file": "assets/heatmaps/1005648.png"
  },
  {
    "player": "Louis Oppie",
    "id": 1137900,
    "url": "https://api.sofascore.app/api/v1/player/1137900/heatmap/overall",
    "file": "assets/heatmaps/1137900.png"
  },
  {
    "player": "Gift Orban",
    "id": 1217613,
    "url": "https://api.sofascore.app/api/v1/player/1217613/heatmap/overall",
    "file": "assets/heatmaps/1217613.png"
  },
  {
    "player": "Willi Orban",
    "id": 136924,
    "url": "https://api.sofascore.app/api/v1/player/136924/heatmap/overall",
    "file": "assets/heatmaps/136924.png"
  },
  {
    "player": "Christian Ordoñez",
    "id": 1201388,
    "url": "https://api.sofascore.app/api/v1/player/1201388/heatmap/overall",
    "file": "assets/heatmaps/1201388.png"
  },
  {
    "player": "Nehemiah Oriola",
    "id": 1899611,
    "url": "https://api.sofascore.app/api/v1/player/1899611/heatmap/overall",
    "file": "assets/heatmaps/1899611.png"
  },
  {
    "player": "Gaetano Oristanio",
    "id": 965009,
    "url": "https://api.sofascore.app/api/v1/player/965009/heatmap/overall",
    "file": "assets/heatmaps/965009.png"
  },
  {
    "player": "Aimar Oroz",
    "id": 985329,
    "url": "https://api.sofascore.app/api/v1/player/985329/heatmap/overall",
    "file": "assets/heatmaps/985329.png"
  },
  {
    "player": "Riccardo Orsolini",
    "id": 793645,
    "url": "https://api.sofascore.app/api/v1/player/793645/heatmap/overall",
    "file": "assets/heatmaps/793645.png"
  },
  {
    "player": "Stefan Ortega",
    "id": 125274,
    "url": "https://api.sofascore.app/api/v1/player/125274/heatmap/overall",
    "file": "assets/heatmaps/125274.png"
  },
  {
    "player": "Ángel Ortíz",
    "id": 1152139,
    "url": "https://api.sofascore.app/api/v1/player/1152139/heatmap/overall",
    "file": "assets/heatmaps/1152139.png"
  },
  {
    "player": "Asier Osambela",
    "id": 1399702,
    "url": "https://api.sofascore.app/api/v1/player/1399702/heatmap/overall",
    "file": "assets/heatmaps/1399702.png"
  },
  {
    "player": "Patrick Osterhage",
    "id": 914755,
    "url": "https://api.sofascore.app/api/v1/player/914755/heatmap/overall",
    "file": "assets/heatmaps/914755.png"
  },
  {
    "player": "William Osula",
    "id": 1122603,
    "url": "https://api.sofascore.app/api/v1/player/1122603/heatmap/overall",
    "file": "assets/heatmaps/1122603.png"
  },
  {
    "player": "Philip Otele",
    "id": 988476,
    "url": "https://api.sofascore.app/api/v1/player/988476/heatmap/overall",
    "file": "assets/heatmaps/988476.png"
  },
  {
    "player": "Sebastian Otoa",
    "id": 1404639,
    "url": "https://api.sofascore.app/api/v1/player/1404639/heatmap/overall",
    "file": "assets/heatmaps/1404639.png"
  },
  {
    "player": "Abdoul Ouattara",
    "id": 1930811,
    "url": "https://api.sofascore.app/api/v1/player/1930811/heatmap/overall",
    "file": "assets/heatmaps/1930811.png"
  },
  {
    "player": "Dango Ouattara",
    "id": 1106451,
    "url": "https://api.sofascore.app/api/v1/player/1106451/heatmap/overall",
    "file": "assets/heatmaps/1106451.png"
  },
  {
    "player": "Kassoum Ouattara",
    "id": 1397558,
    "url": "https://api.sofascore.app/api/v1/player/1397558/heatmap/overall",
    "file": "assets/heatmaps/1397558.png"
  },
  {
    "player": "Assan Ouedraogo",
    "id": 1418623,
    "url": "https://api.sofascore.app/api/v1/player/1418623/heatmap/overall",
    "file": "assets/heatmaps/1418623.png"
  },
  {
    "player": "Azzedine Ounahi",
    "id": 991421,
    "url": "https://api.sofascore.app/api/v1/player/991421/heatmap/overall",
    "file": "assets/heatmaps/991421.png"
  },
  {
    "player": "Elisha Owusu",
    "id": 904424,
    "url": "https://api.sofascore.app/api/v1/player/904424/heatmap/overall",
    "file": "assets/heatmaps/904424.png"
  },
  {
    "player": "Mikel Oyarzabal",
    "id": 823622,
    "url": "https://api.sofascore.app/api/v1/player/823622/heatmap/overall",
    "file": "assets/heatmaps/823622.png"
  },
  {
    "player": "Max Oyedele",
    "id": 1153355,
    "url": "https://api.sofascore.app/api/v1/player/1153355/heatmap/overall",
    "file": "assets/heatmaps/1153355.png"
  },
  {
    "player": "Daniel Oyegoke",
    "id": 998830,
    "url": "https://api.sofascore.app/api/v1/player/998830/heatmap/overall",
    "file": "assets/heatmaps/998830.png"
  },
  {
    "player": "Salih Özcan",
    "id": 795005,
    "url": "https://api.sofascore.app/api/v1/player/795005/heatmap/overall",
    "file": "assets/heatmaps/795005.png"
  },
  {
    "player": "Berke Özer",
    "id": 847494,
    "url": "https://api.sofascore.app/api/v1/player/847494/heatmap/overall",
    "file": "assets/heatmaps/847494.png"
  },
  {
    "player": "Cenk Özkacar",
    "id": 953097,
    "url": "https://api.sofascore.app/api/v1/player/953097/heatmap/overall",
    "file": "assets/heatmaps/953097.png"
  },
  {
    "player": "Nico O’Reilly",
    "id": 1142703,
    "url": "https://api.sofascore.app/api/v1/player/1142703/heatmap/overall",
    "file": "assets/heatmaps/1142703.png"
  },
  {
    "player": "Pablo",
    "id": 1101174,
    "url": "https://api.sofascore.app/api/v1/player/1101174/heatmap/overall",
    "file": "assets/heatmaps/1101174.png"
  },
  {
    "player": "Jon Pacheco",
    "id": 934383,
    "url": "https://api.sofascore.app/api/v1/player/934383/heatmap/overall",
    "file": "assets/heatmaps/934383.png"
  },
  {
    "player": "Willian Pacho",
    "id": 979480,
    "url": "https://api.sofascore.app/api/v1/player/979480/heatmap/overall",
    "file": "assets/heatmaps/979480.png"
  },
  {
    "player": "Daniele Padelli",
    "id": 2899,
    "url": "https://api.sofascore.app/api/v1/player/2899/heatmap/overall",
    "file": "assets/heatmaps/2899.png"
  },
  {
    "player": "Pablo Pagis",
    "id": 1174462,
    "url": "https://api.sofascore.app/api/v1/player/1174462/heatmap/overall",
    "file": "assets/heatmaps/1174462.png"
  },
  {
    "player": "Igor Paixão",
    "id": 981815,
    "url": "https://api.sofascore.app/api/v1/player/981815/heatmap/overall",
    "file": "assets/heatmaps/981815.png"
  },
  {
    "player": "César Palacios",
    "id": 1402688,
    "url": "https://api.sofascore.app/api/v1/player/1402688/heatmap/overall",
    "file": "assets/heatmaps/1402688.png"
  },
  {
    "player": "Exequiel Palacios",
    "id": 822600,
    "url": "https://api.sofascore.app/api/v1/player/822600/heatmap/overall",
    "file": "assets/heatmaps/822600.png"
  },
  {
    "player": "Alberto Paleari",
    "id": 259281,
    "url": "https://api.sofascore.app/api/v1/player/259281/heatmap/overall",
    "file": "assets/heatmaps/259281.png"
  },
  {
    "player": "Marco Palestra",
    "id": 1397736,
    "url": "https://api.sofascore.app/api/v1/player/1397736/heatmap/overall",
    "file": "assets/heatmaps/1397736.png"
  },
  {
    "player": "João Palhinha",
    "id": 364612,
    "url": "https://api.sofascore.app/api/v1/player/364612/heatmap/overall",
    "file": "assets/heatmaps/364612.png"
  },
  {
    "player": "Cole Palmer",
    "id": 982780,
    "url": "https://api.sofascore.app/api/v1/player/982780/heatmap/overall",
    "file": "assets/heatmaps/982780.png"
  },
  {
    "player": "Emerson Palmieri",
    "id": 155997,
    "url": "https://api.sofascore.app/api/v1/player/155997/heatmap/overall",
    "file": "assets/heatmaps/155997.png"
  },
  {
    "player": "Diego Pampín",
    "id": 855837,
    "url": "https://api.sofascore.app/api/v1/player/855837/heatmap/overall",
    "file": "assets/heatmaps/855837.png"
  },
  {
    "player": "Joaquín Panichelli",
    "id": 1410925,
    "url": "https://api.sofascore.app/api/v1/player/1410925/heatmap/overall",
    "file": "assets/heatmaps/1410925.png"
  },
  {
    "player": "Leart Paqarada",
    "id": 151581,
    "url": "https://api.sofascore.app/api/v1/player/151581/heatmap/overall",
    "file": "assets/heatmaps/151581.png"
  },
  {
    "player": "Victor Parada",
    "id": 985726,
    "url": "https://api.sofascore.app/api/v1/player/985726/heatmap/overall",
    "file": "assets/heatmaps/985726.png"
  },
  {
    "player": "Aitor Paredes",
    "id": 959872,
    "url": "https://api.sofascore.app/api/v1/player/959872/heatmap/overall",
    "file": "assets/heatmaps/959872.png"
  },
  {
    "player": "Kevin Paredes",
    "id": 1016810,
    "url": "https://api.sofascore.app/api/v1/player/1016810/heatmap/overall",
    "file": "assets/heatmaps/1016810.png"
  },
  {
    "player": "Daniel Parejo",
    "id": 39182,
    "url": "https://api.sofascore.app/api/v1/player/39182/heatmap/overall",
    "file": "assets/heatmaps/39182.png"
  },
  {
    "player": "Fabiano Parisi",
    "id": 972886,
    "url": "https://api.sofascore.app/api/v1/player/972886/heatmap/overall",
    "file": "assets/heatmaps/972886.png"
  },
  {
    "player": "Thomas Partey",
    "id": 316148,
    "url": "https://api.sofascore.app/api/v1/player/316148/heatmap/overall",
    "file": "assets/heatmaps/316148.png"
  },
  {
    "player": "Mario Pašalić",
    "id": 190437,
    "url": "https://api.sofascore.app/api/v1/player/190437/heatmap/overall",
    "file": "assets/heatmaps/190437.png"
  },
  {
    "player": "Patric",
    "id": 217784,
    "url": "https://api.sofascore.app/api/v1/player/217784/heatmap/overall",
    "file": "assets/heatmaps/217784.png"
  },
  {
    "player": "Nathan Patterson",
    "id": 1020141,
    "url": "https://api.sofascore.app/api/v1/player/1020141/heatmap/overall",
    "file": "assets/heatmaps/1020141.png"
  },
  {
    "player": "Aleksandar Pavlovic",
    "id": 1142251,
    "url": "https://api.sofascore.app/api/v1/player/1142251/heatmap/overall",
    "file": "assets/heatmaps/1142251.png"
  },
  {
    "player": "Strahinja Pavlović",
    "id": 965893,
    "url": "https://api.sofascore.app/api/v1/player/965893/heatmap/overall",
    "file": "assets/heatmaps/965893.png"
  },
  {
    "player": "Leonardo Pavoletti",
    "id": 132704,
    "url": "https://api.sofascore.app/api/v1/player/132704/heatmap/overall",
    "file": "assets/heatmaps/132704.png"
  },
  {
    "player": "Martín Payero",
    "id": 895592,
    "url": "https://api.sofascore.app/api/v1/player/895592/heatmap/overall",
    "file": "assets/heatmaps/895592.png"
  },
  {
    "player": "Mads Pedersen",
    "id": 809219,
    "url": "https://api.sofascore.app/api/v1/player/809219/heatmap/overall",
    "file": "assets/heatmaps/809219.png"
  },
  {
    "player": "Marcus Pedersen",
    "id": 934409,
    "url": "https://api.sofascore.app/api/v1/player/934409/heatmap/overall",
    "file": "assets/heatmaps/934409.png"
  },
  {
    "player": "Alfonso Pedraza",
    "id": 797290,
    "url": "https://api.sofascore.app/api/v1/player/797290/heatmap/overall",
    "file": "assets/heatmaps/797290.png"
  },
  {
    "player": "Pedri",
    "id": 992587,
    "url": "https://api.sofascore.app/api/v1/player/992587/heatmap/overall",
    "file": "assets/heatmaps/992587.png"
  },
  {
    "player": "Pedro",
    "id": 35428,
    "url": "https://api.sofascore.app/api/v1/player/35428/heatmap/overall",
    "file": "assets/heatmaps/35428.png"
  },
  {
    "player": "Zé Pedro Figueiredo",
    "id": 945448,
    "url": "https://api.sofascore.app/api/v1/player/945448/heatmap/overall",
    "file": "assets/heatmaps/945448.png"
  },
  {
    "player": "Dženan Pejčinović",
    "id": 1127790,
    "url": "https://api.sofascore.app/api/v1/player/1127790/heatmap/overall",
    "file": "assets/heatmaps/1127790.png"
  },
  {
    "player": "Lorenzo Pellegrini",
    "id": 555540,
    "url": "https://api.sofascore.app/api/v1/player/555540/heatmap/overall",
    "file": "assets/heatmaps/555540.png"
  },
  {
    "player": "Luca Pellegrini",
    "id": 826186,
    "url": "https://api.sofascore.app/api/v1/player/826186/heatmap/overall",
    "file": "assets/heatmaps/826186.png"
  },
  {
    "player": "Mateo Pellegrino",
    "id": 1099296,
    "url": "https://api.sofascore.app/api/v1/player/1099296/heatmap/overall",
    "file": "assets/heatmaps/1099296.png"
  },
  {
    "player": "Timothee Pembele",
    "id": 1824137,
    "url": "https://api.sofascore.app/api/v1/player/1824137/heatmap/overall",
    "file": "assets/heatmaps/1824137.png"
  },
  {
    "player": "Faris Pemi Moumbagna",
    "id": 1029456,
    "url": "https://api.sofascore.app/api/v1/player/1029456/heatmap/overall",
    "file": "assets/heatmaps/1029456.png"
  },
  {
    "player": "Iñaki Peña",
    "id": 794949,
    "url": "https://api.sofascore.app/api/v1/player/794949/heatmap/overall",
    "file": "assets/heatmaps/794949.png"
  },
  {
    "player": "Mike Penders",
    "id": 1149148,
    "url": "https://api.sofascore.app/api/v1/player/1149148/heatmap/overall",
    "file": "assets/heatmaps/1149148.png"
  },
  {
    "player": "Nicolas Pépé",
    "id": 593526,
    "url": "https://api.sofascore.app/api/v1/player/593526/heatmap/overall",
    "file": "assets/heatmaps/593526.png"
  },
  {
    "player": "Kojo Peprah Oppong",
    "id": 1473092,
    "url": "https://api.sofascore.app/api/v1/player/1473092/heatmap/overall",
    "file": "assets/heatmaps/1473092.png"
  },
  {
    "player": "Peque",
    "id": 997033,
    "url": "https://api.sofascore.app/api/v1/player/997033/heatmap/overall",
    "file": "assets/heatmaps/997033.png"
  },
  {
    "player": "Mathias Pereira Lage",
    "id": 831400,
    "url": "https://api.sofascore.app/api/v1/player/831400/heatmap/overall",
    "file": "assets/heatmaps/831400.png"
  },
  {
    "player": "Ángel Pérez",
    "id": 1513222,
    "url": "https://api.sofascore.app/api/v1/player/1513222/heatmap/overall",
    "file": "assets/heatmaps/1513222.png"
  },
  {
    "player": "Ayoze Pérez",
    "id": 345195,
    "url": "https://api.sofascore.app/api/v1/player/345195/heatmap/overall",
    "file": "assets/heatmaps/345195.png"
  },
  {
    "player": "Matías Pérez",
    "id": 1801193,
    "url": "https://api.sofascore.app/api/v1/player/1801193/heatmap/overall",
    "file": "assets/heatmaps/1801193.png"
  },
  {
    "player": "Nacho Pérez",
    "id": 2049311,
    "url": "https://api.sofascore.app/api/v1/player/2049311/heatmap/overall",
    "file": "assets/heatmaps/2049311.png"
  },
  {
    "player": "Simone Perilli",
    "id": 253369,
    "url": "https://api.sofascore.app/api/v1/player/253369/heatmap/overall",
    "file": "assets/heatmaps/253369.png"
  },
  {
    "player": "Mattia Perin",
    "id": 79645,
    "url": "https://api.sofascore.app/api/v1/player/79645/heatmap/overall",
    "file": "assets/heatmaps/79645.png"
  },
  {
    "player": "Romain Perraud",
    "id": 827519,
    "url": "https://api.sofascore.app/api/v1/player/827519/heatmap/overall",
    "file": "assets/heatmaps/827519.png"
  },
  {
    "player": "Lucas Perri",
    "id": 871290,
    "url": "https://api.sofascore.app/api/v1/player/871290/heatmap/overall",
    "file": "assets/heatmaps/871290.png"
  },
  {
    "player": "Gaëtan Perrin",
    "id": 827506,
    "url": "https://api.sofascore.app/api/v1/player/827506/heatmap/overall",
    "file": "assets/heatmaps/827506.png"
  },
  {
    "player": "Máximo Perrone",
    "id": 1086286,
    "url": "https://api.sofascore.app/api/v1/player/1086286/heatmap/overall",
    "file": "assets/heatmaps/1086286.png"
  },
  {
    "player": "Massimo Pessina",
    "id": 1530540,
    "url": "https://api.sofascore.app/api/v1/player/1530540/heatmap/overall",
    "file": "assets/heatmaps/1530540.png"
  },
  {
    "player": "Prosper Peter",
    "id": 2137784,
    "url": "https://api.sofascore.app/api/v1/player/2137784/heatmap/overall",
    "file": "assets/heatmaps/2137784.png"
  },
  {
    "player": "Léo Pétrot",
    "id": 827504,
    "url": "https://api.sofascore.app/api/v1/player/827504/heatmap/overall",
    "file": "assets/heatmaps/827504.png"
  },
  {
    "player": "Đorđe Petrović",
    "id": 882604,
    "url": "https://api.sofascore.app/api/v1/player/882604/heatmap/overall",
    "file": "assets/heatmaps/882604.png"
  },
  {
    "player": "Giuseppe Pezzella",
    "id": 814589,
    "url": "https://api.sofascore.app/api/v1/player/814589/heatmap/overall",
    "file": "assets/heatmaps/814589.png"
  },
  {
    "player": "Rayan Philippe",
    "id": 991824,
    "url": "https://api.sofascore.app/api/v1/player/991824/heatmap/overall",
    "file": "assets/heatmaps/991824.png"
  },
  {
    "player": "Gabriele Piccinini",
    "id": 970778,
    "url": "https://api.sofascore.app/api/v1/player/970778/heatmap/overall",
    "file": "assets/heatmaps/970778.png"
  },
  {
    "player": "Roberto Piccoli",
    "id": 958982,
    "url": "https://api.sofascore.app/api/v1/player/958982/heatmap/overall",
    "file": "assets/heatmaps/958982.png"
  },
  {
    "player": "Charles Pickel",
    "id": 758664,
    "url": "https://api.sofascore.app/api/v1/player/758664/heatmap/overall",
    "file": "assets/heatmaps/758664.png"
  },
  {
    "player": "Jordan Pickford",
    "id": 138530,
    "url": "https://api.sofascore.app/api/v1/player/138530/heatmap/overall",
    "file": "assets/heatmaps/138530.png"
  },
  {
    "player": "Amos Pieper",
    "id": 851254,
    "url": "https://api.sofascore.app/api/v1/player/851254/heatmap/overall",
    "file": "assets/heatmaps/851254.png"
  },
  {
    "player": "Marvin Pieringer",
    "id": 909485,
    "url": "https://api.sofascore.app/api/v1/player/909485/heatmap/overall",
    "file": "assets/heatmaps/909485.png"
  },
  {
    "player": "Santiago Pierotti",
    "id": 984998,
    "url": "https://api.sofascore.app/api/v1/player/984998/heatmap/overall",
    "file": "assets/heatmaps/984998.png"
  },
  {
    "player": "Andrea Pinamonti",
    "id": 826198,
    "url": "https://api.sofascore.app/api/v1/player/826198/heatmap/overall",
    "file": "assets/heatmaps/826198.png"
  },
  {
    "player": "Thiago Pinar",
    "id": 2237795,
    "url": "https://api.sofascore.app/api/v1/player/2237795/heatmap/overall",
    "file": "assets/heatmaps/2237795.png"
  },
  {
    "player": "Lander Pinillos",
    "id": 1122588,
    "url": "https://api.sofascore.app/api/v1/player/1122588/heatmap/overall",
    "file": "assets/heatmaps/1122588.png"
  },
  {
    "player": "Ethan Pinnock",
    "id": 855864,
    "url": "https://api.sofascore.app/api/v1/player/855864/heatmap/overall",
    "file": "assets/heatmaps/855864.png"
  },
  {
    "player": "Yeremi Pino",
    "id": 984624,
    "url": "https://api.sofascore.app/api/v1/player/984624/heatmap/overall",
    "file": "assets/heatmaps/984624.png"
  },
  {
    "player": "Jakub Piotrowski",
    "id": 825271,
    "url": "https://api.sofascore.app/api/v1/player/825271/heatmap/overall",
    "file": "assets/heatmaps/825271.png"
  },
  {
    "player": "Joël Piroe",
    "id": 850823,
    "url": "https://api.sofascore.app/api/v1/player/850823/heatmap/overall",
    "file": "assets/heatmaps/850823.png"
  },
  {
    "player": "Niccolò Pisilli",
    "id": 1175821,
    "url": "https://api.sofascore.app/api/v1/player/1175821/heatmap/overall",
    "file": "assets/heatmaps/1175821.png"
  },
  {
    "player": "Tommaso Pobega",
    "id": 928796,
    "url": "https://api.sofascore.app/api/v1/player/928796/heatmap/overall",
    "file": "assets/heatmaps/928796.png"
  },
  {
    "player": "Paul Pogba",
    "id": 111802,
    "url": "https://api.sofascore.app/api/v1/player/111802/heatmap/overall",
    "file": "assets/heatmaps/111802.png"
  },
  {
    "player": "Ernest Poku",
    "id": 1119502,
    "url": "https://api.sofascore.app/api/v1/player/1119502/heatmap/overall",
    "file": "assets/heatmaps/1119502.png"
  },
  {
    "player": "Matteo Politano",
    "id": 235672,
    "url": "https://api.sofascore.app/api/v1/player/235672/heatmap/overall",
    "file": "assets/heatmaps/235672.png"
  },
  {
    "player": "Oumar Pona",
    "id": 1651830,
    "url": "https://api.sofascore.app/api/v1/player/1651830/heatmap/overall",
    "file": "assets/heatmaps/1651830.png"
  },
  {
    "player": "Marin Pongračić",
    "id": 847467,
    "url": "https://api.sofascore.app/api/v1/player/847467/heatmap/overall",
    "file": "assets/heatmaps/847467.png"
  },
  {
    "player": "Nick Pope",
    "id": 162653,
    "url": "https://api.sofascore.app/api/v1/player/162653/heatmap/overall",
    "file": "assets/heatmaps/162653.png"
  },
  {
    "player": "Pedro Porro",
    "id": 913654,
    "url": "https://api.sofascore.app/api/v1/player/913654/heatmap/overall",
    "file": "assets/heatmaps/913654.png"
  },
  {
    "player": "Portu",
    "id": 218616,
    "url": "https://api.sofascore.app/api/v1/player/218616/heatmap/overall",
    "file": "assets/heatmaps/218616.png"
  },
  {
    "player": "Stefan Posch",
    "id": 355486,
    "url": "https://api.sofascore.app/api/v1/player/355486/heatmap/overall",
    "file": "assets/heatmaps/355486.png"
  },
  {
    "player": "Freddie Potts",
    "id": 1089582,
    "url": "https://api.sofascore.app/api/v1/player/1089582/heatmap/overall",
    "file": "assets/heatmaps/1089582.png"
  },
  {
    "player": "Kacper Potulski",
    "id": 1548910,
    "url": "https://api.sofascore.app/api/v1/player/1548910/heatmap/overall",
    "file": "assets/heatmaps/1548910.png"
  },
  {
    "player": "Yussuf Poulsen",
    "id": 135264,
    "url": "https://api.sofascore.app/api/v1/player/135264/heatmap/overall",
    "file": "assets/heatmaps/135264.png"
  },
  {
    "player": "Beñat Prados",
    "id": 1012409,
    "url": "https://api.sofascore.app/api/v1/player/1012409/heatmap/overall",
    "file": "assets/heatmaps/1012409.png"
  },
  {
    "player": "Alexander Prass",
    "id": 978062,
    "url": "https://api.sofascore.app/api/v1/player/978062/heatmap/overall",
    "file": "assets/heatmaps/978062.png"
  },
  {
    "player": "Abdón Prats",
    "id": 146852,
    "url": "https://api.sofascore.app/api/v1/player/146852/heatmap/overall",
    "file": "assets/heatmaps/146852.png"
  },
  {
    "player": "Grischa Prömel",
    "id": 253993,
    "url": "https://api.sofascore.app/api/v1/player/253993/heatmap/overall",
    "file": "assets/heatmaps/253993.png"
  },
  {
    "player": "Ivan Provedel",
    "id": 308182,
    "url": "https://api.sofascore.app/api/v1/player/308182/heatmap/overall",
    "file": "assets/heatmaps/308182.png"
  },
  {
    "player": "Javi Puado",
    "id": 891511,
    "url": "https://api.sofascore.app/api/v1/player/891511/heatmap/overall",
    "file": "assets/heatmaps/891511.png"
  },
  {
    "player": "Marc Pubill",
    "id": 1094106,
    "url": "https://api.sofascore.app/api/v1/player/1094106/heatmap/overall",
    "file": "assets/heatmaps/1094106.png"
  },
  {
    "player": "Cameron Puertas",
    "id": 916176,
    "url": "https://api.sofascore.app/api/v1/player/916176/heatmap/overall",
    "file": "assets/heatmaps/916176.png"
  },
  {
    "player": "Christian Pulisic",
    "id": 817957,
    "url": "https://api.sofascore.app/api/v1/player/817957/heatmap/overall",
    "file": "assets/heatmaps/817957.png"
  },
  {
    "player": "Arkadiusz Pyrka",
    "id": 971481,
    "url": "https://api.sofascore.app/api/v1/player/971481/heatmap/overall",
    "file": "assets/heatmaps/971481.png"
  },
  {
    "player": "Jarell Quansah",
    "id": 1003339,
    "url": "https://api.sofascore.app/api/v1/player/1003339/heatmap/overall",
    "file": "assets/heatmaps/1003339.png"
  },
  {
    "player": "Leopold Querfeld",
    "id": 1086547,
    "url": "https://api.sofascore.app/api/v1/player/1086547/heatmap/overall",
    "file": "assets/heatmaps/1086547.png"
  },
  {
    "player": "Kenny Quetant",
    "id": 2198657,
    "url": "https://api.sofascore.app/api/v1/player/2198657/heatmap/overall",
    "file": "assets/heatmaps/2198657.png"
  },
  {
    "player": "Matheo Raab",
    "id": 842718,
    "url": "https://api.sofascore.app/api/v1/player/842718/heatmap/overall",
    "file": "assets/heatmaps/842718.png"
  },
  {
    "player": "Dani Raba",
    "id": 873947,
    "url": "https://api.sofascore.app/api/v1/player/873947/heatmap/overall",
    "file": "assets/heatmaps/873947.png"
  },
  {
    "player": "Adrien Rabiot",
    "id": 250737,
    "url": "https://api.sofascore.app/api/v1/player/250737/heatmap/overall",
    "file": "assets/heatmaps/250737.png"
  },
  {
    "player": "Uroš Radaković",
    "id": 151900,
    "url": "https://api.sofascore.app/api/v1/player/151900/heatmap/overall",
    "file": "assets/heatmaps/151900.png"
  },
  {
    "player": "Ionuț Radu",
    "id": 815202,
    "url": "https://api.sofascore.app/api/v1/player/815202/heatmap/overall",
    "file": "assets/heatmaps/815202.png"
  },
  {
    "player": "Antonio Raillo",
    "id": 807116,
    "url": "https://api.sofascore.app/api/v1/player/807116/heatmap/overall",
    "file": "assets/heatmaps/807116.png"
  },
  {
    "player": "Ylber Ramadani",
    "id": 841977,
    "url": "https://api.sofascore.app/api/v1/player/841977/heatmap/overall",
    "file": "assets/heatmaps/841977.png"
  },
  {
    "player": "Diant Ramaj",
    "id": 981562,
    "url": "https://api.sofascore.app/api/v1/player/981562/heatmap/overall",
    "file": "assets/heatmaps/981562.png"
  },
  {
    "player": "Largie Ramazani",
    "id": 909966,
    "url": "https://api.sofascore.app/api/v1/player/909966/heatmap/overall",
    "file": "assets/heatmaps/909966.png"
  },
  {
    "player": "Jacobo Ramón",
    "id": 1403348,
    "url": "https://api.sofascore.app/api/v1/player/1403348/heatmap/overall",
    "file": "assets/heatmaps/1403348.png"
  },
  {
    "player": "Gonçalo Ramos",
    "id": 934510,
    "url": "https://api.sofascore.app/api/v1/player/934510/heatmap/overall",
    "file": "assets/heatmaps/934510.png"
  },
  {
    "player": "Aaron Ramsdale",
    "id": 839410,
    "url": "https://api.sofascore.app/api/v1/player/839410/heatmap/overall",
    "file": "assets/heatmaps/839410.png"
  },
  {
    "player": "Jacob Ramsey",
    "id": 975937,
    "url": "https://api.sofascore.app/api/v1/player/975937/heatmap/overall",
    "file": "assets/heatmaps/975937.png"
  },
  {
    "player": "Luca Ranieri",
    "id": 893998,
    "url": "https://api.sofascore.app/api/v1/player/893998/heatmap/overall",
    "file": "assets/heatmaps/893998.png"
  },
  {
    "player": "Lilian Raolisoa",
    "id": 1462778,
    "url": "https://api.sofascore.app/api/v1/player/1462778/heatmap/overall",
    "file": "assets/heatmaps/1462778.png"
  },
  {
    "player": "Raphinha",
    "id": 831005,
    "url": "https://api.sofascore.app/api/v1/player/831005/heatmap/overall",
    "file": "assets/heatmaps/831005.png"
  },
  {
    "player": "Marcus Rashford",
    "id": 814590,
    "url": "https://api.sofascore.app/api/v1/player/814590/heatmap/overall",
    "file": "assets/heatmaps/814590.png"
  },
  {
    "player": "Mathias Rasmussen",
    "id": 834244,
    "url": "https://api.sofascore.app/api/v1/player/834244/heatmap/overall",
    "file": "assets/heatmaps/834244.png"
  },
  {
    "player": "Andrei Ratiu",
    "id": 965031,
    "url": "https://api.sofascore.app/api/v1/player/965031/heatmap/overall",
    "file": "assets/heatmaps/965031.png"
  },
  {
    "player": "Petar Ratkov",
    "id": 1101942,
    "url": "https://api.sofascore.app/api/v1/player/1101942/heatmap/overall",
    "file": "assets/heatmaps/1101942.png"
  },
  {
    "player": "Raúl",
    "id": 997280,
    "url": "https://api.sofascore.app/api/v1/player/997280/heatmap/overall",
    "file": "assets/heatmaps/997280.png"
  },
  {
    "player": "David Raum",
    "id": 856076,
    "url": "https://api.sofascore.app/api/v1/player/856076/heatmap/overall",
    "file": "assets/heatmaps/856076.png"
  },
  {
    "player": "Federico Ravaglia",
    "id": 850952,
    "url": "https://api.sofascore.app/api/v1/player/850952/heatmap/overall",
    "file": "assets/heatmaps/850952.png"
  },
  {
    "player": "David Raya",
    "id": 581310,
    "url": "https://api.sofascore.app/api/v1/player/581310/heatmap/overall",
    "file": "assets/heatmaps/581310.png"
  },
  {
    "player": "Federico Redondo",
    "id": 1117026,
    "url": "https://api.sofascore.app/api/v1/player/1117026/heatmap/overall",
    "file": "assets/heatmaps/1117026.png"
  },
  {
    "player": "Harrison Reed",
    "id": 365802,
    "url": "https://api.sofascore.app/api/v1/player/365802/heatmap/overall",
    "file": "assets/heatmaps/365802.png"
  },
  {
    "player": "Luca Reggiani",
    "id": 1937833,
    "url": "https://api.sofascore.app/api/v1/player/1937833/heatmap/overall",
    "file": "assets/heatmaps/1937833.png"
  },
  {
    "player": "Alejandro Rego",
    "id": 2110897,
    "url": "https://api.sofascore.app/api/v1/player/2110897/heatmap/overall",
    "file": "assets/heatmaps/2110897.png"
  },
  {
    "player": "Tijjani Reijnders",
    "id": 893549,
    "url": "https://api.sofascore.app/api/v1/player/893549/heatmap/overall",
    "file": "assets/heatmaps/893549.png"
  },
  {
    "player": "Alberto Reina",
    "id": 882475,
    "url": "https://api.sofascore.app/api/v1/player/882475/heatmap/overall",
    "file": "assets/heatmaps/882475.png"
  },
  {
    "player": "Vitor Reis",
    "id": 1485300,
    "url": "https://api.sofascore.app/api/v1/player/1485300/heatmap/overall",
    "file": "assets/heatmaps/1485300.png"
  },
  {
    "player": "Rocco Reitz",
    "id": 1048650,
    "url": "https://api.sofascore.app/api/v1/player/1048650/heatmap/overall",
    "file": "assets/heatmaps/1048650.png"
  },
  {
    "player": "Nicolai Remberg",
    "id": 1064305,
    "url": "https://api.sofascore.app/api/v1/player/1064305/heatmap/overall",
    "file": "assets/heatmaps/1064305.png"
  },
  {
    "player": "Álex Remiro",
    "id": 791773,
    "url": "https://api.sofascore.app/api/v1/player/791773/heatmap/overall",
    "file": "assets/heatmaps/791773.png"
  },
  {
    "player": "Devyne Rensch",
    "id": 982778,
    "url": "https://api.sofascore.app/api/v1/player/982778/heatmap/overall",
    "file": "assets/heatmaps/982778.png"
  },
  {
    "player": "Guillaume Restes",
    "id": 1154630,
    "url": "https://api.sofascore.app/api/v1/player/1154630/heatmap/overall",
    "file": "assets/heatmaps/1154630.png"
  },
  {
    "player": "Elvis Rexhbeçaj",
    "id": 842188,
    "url": "https://api.sofascore.app/api/v1/player/842188/heatmap/overall",
    "file": "assets/heatmaps/842188.png"
  },
  {
    "player": "Oriol Rey",
    "id": 859769,
    "url": "https://api.sofascore.app/api/v1/player/859769/heatmap/overall",
    "file": "assets/heatmaps/859769.png"
  },
  {
    "player": "Chadi Riad",
    "id": 1064218,
    "url": "https://api.sofascore.app/api/v1/player/1064218/heatmap/overall",
    "file": "assets/heatmaps/1064218.png"
  },
  {
    "player": "Alexsandro Ribeiro",
    "id": 1049775,
    "url": "https://api.sofascore.app/api/v1/player/1049775/heatmap/overall",
    "file": "assets/heatmaps/1049775.png"
  },
  {
    "player": "Samuele Ricci",
    "id": 930189,
    "url": "https://api.sofascore.app/api/v1/player/930189/heatmap/overall",
    "file": "assets/heatmaps/930189.png"
  },
  {
    "player": "Declan Rice",
    "id": 856714,
    "url": "https://api.sofascore.app/api/v1/player/856714/heatmap/overall",
    "file": "assets/heatmaps/856714.png"
  },
  {
    "player": "Chris Richards",
    "id": 931844,
    "url": "https://api.sofascore.app/api/v1/player/931844/heatmap/overall",
    "file": "assets/heatmaps/931844.png"
  },
  {
    "player": "Richarlison",
    "id": 840217,
    "url": "https://api.sofascore.app/api/v1/player/840217/heatmap/overall",
    "file": "assets/heatmaps/840217.png"
  },
  {
    "player": "Diego Rico",
    "id": 350560,
    "url": "https://api.sofascore.app/api/v1/player/350560/heatmap/overall",
    "file": "assets/heatmaps/350560.png"
  },
  {
    "player": "Clemens Riedel",
    "id": 1129360,
    "url": "https://api.sofascore.app/api/v1/player/1129360/heatmap/overall",
    "file": "assets/heatmaps/1129360.png"
  },
  {
    "player": "Lasse Rieß",
    "id": 1069252,
    "url": "https://api.sofascore.app/api/v1/player/1069252/heatmap/overall",
    "file": "assets/heatmaps/1069252.png"
  },
  {
    "player": "Chris Rigg",
    "id": 1394089,
    "url": "https://api.sofascore.app/api/v1/player/1394089/heatmap/overall",
    "file": "assets/heatmaps/1394089.png"
  },
  {
    "player": "Filippo Rinaldi",
    "id": 1002428,
    "url": "https://api.sofascore.app/api/v1/player/1002428/heatmap/overall",
    "file": "assets/heatmaps/1002428.png"
  },
  {
    "player": "Hugo Rincón",
    "id": 1632454,
    "url": "https://api.sofascore.app/api/v1/player/1632454/heatmap/overall",
    "file": "assets/heatmaps/1632454.png"
  },
  {
    "player": "Luis Rioja",
    "id": 900433,
    "url": "https://api.sofascore.app/api/v1/player/900433/heatmap/overall",
    "file": "assets/heatmaps/900433.png"
  },
  {
    "player": "Rodrigo Riquelme",
    "id": 989113,
    "url": "https://api.sofascore.app/api/v1/player/989113/heatmap/overall",
    "file": "assets/heatmaps/989113.png"
  },
  {
    "player": "Robin Risser",
    "id": 1387161,
    "url": "https://api.sofascore.app/api/v1/player/1387161/heatmap/overall",
    "file": "assets/heatmaps/1387161.png"
  },
  {
    "player": "Mihailo Ristić",
    "id": 363774,
    "url": "https://api.sofascore.app/api/v1/player/363774/heatmap/overall",
    "file": "assets/heatmaps/363774.png"
  },
  {
    "player": "Lars Ritzka",
    "id": 873347,
    "url": "https://api.sofascore.app/api/v1/player/873347/heatmap/overall",
    "file": "assets/heatmaps/873347.png"
  },
  {
    "player": "Sergi Roberto",
    "id": 123976,
    "url": "https://api.sofascore.app/api/v1/player/123976/heatmap/overall",
    "file": "assets/heatmaps/123976.png"
  },
  {
    "player": "Andrew Robertson",
    "id": 262911,
    "url": "https://api.sofascore.app/api/v1/player/262911/heatmap/overall",
    "file": "assets/heatmaps/262911.png"
  },
  {
    "player": "Antonee Robinson",
    "id": 803174,
    "url": "https://api.sofascore.app/api/v1/player/803174/heatmap/overall",
    "file": "assets/heatmaps/803174.png"
  },
  {
    "player": "Joel Roca",
    "id": 1391616,
    "url": "https://api.sofascore.app/api/v1/player/1391616/heatmap/overall",
    "file": "assets/heatmaps/1391616.png"
  },
  {
    "player": "Marc Roca",
    "id": 847128,
    "url": "https://api.sofascore.app/api/v1/player/847128/heatmap/overall",
    "file": "assets/heatmaps/847128.png"
  },
  {
    "player": "Ryan Rodin",
    "id": 1927696,
    "url": "https://api.sofascore.app/api/v1/player/1927696/heatmap/overall",
    "file": "assets/heatmaps/1927696.png"
  },
  {
    "player": "Kaden Rodney",
    "id": 1185603,
    "url": "https://api.sofascore.app/api/v1/player/1185603/heatmap/overall",
    "file": "assets/heatmaps/1185603.png"
  },
  {
    "player": "Joe Rodon",
    "id": 828640,
    "url": "https://api.sofascore.app/api/v1/player/828640/heatmap/overall",
    "file": "assets/heatmaps/828640.png"
  },
  {
    "player": "Rodri",
    "id": 827606,
    "url": "https://api.sofascore.app/api/v1/player/827606/heatmap/overall",
    "file": "assets/heatmaps/827606.png"
  },
  {
    "player": "Álvaro Rodríguez",
    "id": 1154587,
    "url": "https://api.sofascore.app/api/v1/player/1154587/heatmap/overall",
    "file": "assets/heatmaps/1154587.png"
  },
  {
    "player": "Guido Rodríguez",
    "id": 609752,
    "url": "https://api.sofascore.app/api/v1/player/609752/heatmap/overall",
    "file": "assets/heatmaps/609752.png"
  },
  {
    "player": "Javi Rodríguez",
    "id": 1526627,
    "url": "https://api.sofascore.app/api/v1/player/1526627/heatmap/overall",
    "file": "assets/heatmaps/1526627.png"
  },
  {
    "player": "Jesus Rodríguez",
    "id": 1800245,
    "url": "https://api.sofascore.app/api/v1/player/1800245/heatmap/overall",
    "file": "assets/heatmaps/1800245.png"
  },
  {
    "player": "Juan Rodríguez",
    "id": 1485391,
    "url": "https://api.sofascore.app/api/v1/player/1485391/heatmap/overall",
    "file": "assets/heatmaps/1485391.png"
  },
  {
    "player": "Ricardo Rodríguez",
    "id": 67769,
    "url": "https://api.sofascore.app/api/v1/player/67769/heatmap/overall",
    "file": "assets/heatmaps/67769.png"
  },
  {
    "player": "Rodrygo",
    "id": 910536,
    "url": "https://api.sofascore.app/api/v1/player/910536/heatmap/overall",
    "file": "assets/heatmaps/910536.png"
  },
  {
    "player": "Robin Roefs",
    "id": 1012928,
    "url": "https://api.sofascore.app/api/v1/player/1012928/heatmap/overall",
    "file": "assets/heatmaps/1012928.png"
  },
  {
    "player": "Morgan Rogers",
    "id": 948261,
    "url": "https://api.sofascore.app/api/v1/player/948261/heatmap/overall",
    "file": "assets/heatmaps/948261.png"
  },
  {
    "player": "Merlin Röhl",
    "id": 1064082,
    "url": "https://api.sofascore.app/api/v1/player/1064082/heatmap/overall",
    "file": "assets/heatmaps/1064082.png"
  },
  {
    "player": "Filippo Romagna",
    "id": 356032,
    "url": "https://api.sofascore.app/api/v1/player/356032/heatmap/overall",
    "file": "assets/heatmaps/356032.png"
  },
  {
    "player": "Alessio Romagnoli",
    "id": 227864,
    "url": "https://api.sofascore.app/api/v1/player/227864/heatmap/overall",
    "file": "assets/heatmaps/227864.png"
  },
  {
    "player": "Leo Román",
    "id": 1131909,
    "url": "https://api.sofascore.app/api/v1/player/1131909/heatmap/overall",
    "file": "assets/heatmaps/1131909.png"
  },
  {
    "player": "Miguel Román",
    "id": 1398526,
    "url": "https://api.sofascore.app/api/v1/player/1398526/heatmap/overall",
    "file": "assets/heatmaps/1398526.png"
  },
  {
    "player": "Carlos Romero",
    "id": 1396048,
    "url": "https://api.sofascore.app/api/v1/player/1396048/heatmap/overall",
    "file": "assets/heatmaps/1396048.png"
  },
  {
    "player": "Cristian Romero",
    "id": 829932,
    "url": "https://api.sofascore.app/api/v1/player/829932/heatmap/overall",
    "file": "assets/heatmaps/829932.png"
  },
  {
    "player": "Isaac Romero",
    "id": 1018190,
    "url": "https://api.sofascore.app/api/v1/player/1018190/heatmap/overall",
    "file": "assets/heatmaps/1018190.png"
  },
  {
    "player": "Iván Romero",
    "id": 1014042,
    "url": "https://api.sofascore.app/api/v1/player/1014042/heatmap/overall",
    "file": "assets/heatmaps/1014042.png"
  },
  {
    "player": "Zaid Romero",
    "id": 1108450,
    "url": "https://api.sofascore.app/api/v1/player/1108450/heatmap/overall",
    "file": "assets/heatmaps/1108450.png"
  },
  {
    "player": "Rômulo",
    "id": 1133743,
    "url": "https://api.sofascore.app/api/v1/player/1133743/heatmap/overall",
    "file": "assets/heatmaps/1133743.png"
  },
  {
    "player": "Valentin Rongier",
    "id": 581314,
    "url": "https://api.sofascore.app/api/v1/player/581314/heatmap/overall",
    "file": "assets/heatmaps/581314.png"
  },
  {
    "player": "Marten de Roon",
    "id": 100389,
    "url": "https://api.sofascore.app/api/v1/player/100389/heatmap/overall",
    "file": "assets/heatmaps/100389.png"
  },
  {
    "player": "Max Rosenfelder",
    "id": 1131337,
    "url": "https://api.sofascore.app/api/v1/player/1131337/heatmap/overall",
    "file": "assets/heatmaps/1131337.png"
  },
  {
    "player": "Valentin Rosier",
    "id": 842419,
    "url": "https://api.sofascore.app/api/v1/player/842419/heatmap/overall",
    "file": "assets/heatmaps/842419.png"
  },
  {
    "player": "Tom Rothe",
    "id": 1210666,
    "url": "https://api.sofascore.app/api/v1/player/1210666/heatmap/overall",
    "file": "assets/heatmaps/1210666.png"
  },
  {
    "player": "Anthony Rouault",
    "id": 991479,
    "url": "https://api.sofascore.app/api/v1/player/991479/heatmap/overall",
    "file": "assets/heatmaps/991479.png"
  },
  {
    "player": "Nicolò Rovella",
    "id": 937324,
    "url": "https://api.sofascore.app/api/v1/player/937324/heatmap/overall",
    "file": "assets/heatmaps/937324.png"
  },
  {
    "player": "James Rowswell",
    "id": 1403130,
    "url": "https://api.sofascore.app/api/v1/player/1403130/heatmap/overall",
    "file": "assets/heatmaps/1403130.png"
  },
  {
    "player": "Amir Rrahmani",
    "id": 332155,
    "url": "https://api.sofascore.app/api/v1/player/332155/heatmap/overall",
    "file": "assets/heatmaps/332155.png"
  },
  {
    "player": "Rubén",
    "id": 1021165,
    "url": "https://api.sofascore.app/api/v1/player/1021165/heatmap/overall",
    "file": "assets/heatmaps/1021165.png"
  },
  {
    "player": "Antonio Rüdiger",
    "id": 142622,
    "url": "https://api.sofascore.app/api/v1/player/142622/heatmap/overall",
    "file": "assets/heatmaps/142622.png"
  },
  {
    "player": "Javier Rueda Garcia",
    "id": 1008259,
    "url": "https://api.sofascore.app/api/v1/player/1008259/heatmap/overall",
    "file": "assets/heatmaps/1008259.png"
  },
  {
    "player": "Matteo Ruggeri",
    "id": 965011,
    "url": "https://api.sofascore.app/api/v1/player/965011/heatmap/overall",
    "file": "assets/heatmaps/965011.png"
  },
  {
    "player": "Aitor Ruibal",
    "id": 893062,
    "url": "https://api.sofascore.app/api/v1/player/893062/heatmap/overall",
    "file": "assets/heatmaps/893062.png"
  },
  {
    "player": "Abel Ruiz",
    "id": 826013,
    "url": "https://api.sofascore.app/api/v1/player/826013/heatmap/overall",
    "file": "assets/heatmaps/826013.png"
  },
  {
    "player": "Fabián Ruiz Peña",
    "id": 784655,
    "url": "https://api.sofascore.app/api/v1/player/784655/heatmap/overall",
    "file": "assets/heatmaps/784655.png"
  },
  {
    "player": "Gerónimo Rulli",
    "id": 128383,
    "url": "https://api.sofascore.app/api/v1/player/128383/heatmap/overall",
    "file": "assets/heatmaps/128383.png"
  },
  {
    "player": "Jacen Russell-Rowe",
    "id": 1002267,
    "url": "https://api.sofascore.app/api/v1/player/1002267/heatmap/overall",
    "file": "assets/heatmaps/1002267.png"
  },
  {
    "player": "Georginio Rutter",
    "id": 946695,
    "url": "https://api.sofascore.app/api/v1/player/946695/heatmap/overall",
    "file": "assets/heatmaps/946695.png"
  },
  {
    "player": "Mathew Ryan",
    "id": 134029,
    "url": "https://api.sofascore.app/api/v1/player/134029/heatmap/overall",
    "file": "assets/heatmaps/134029.png"
  },
  {
    "player": "Julian Ryerson",
    "id": 800951,
    "url": "https://api.sofascore.app/api/v1/player/800951/heatmap/overall",
    "file": "assets/heatmaps/800951.png"
  },
  {
    "player": "Frederik Rønnow",
    "id": 137692,
    "url": "https://api.sofascore.app/api/v1/player/137692/heatmap/overall",
    "file": "assets/heatmaps/137692.png"
  },
  {
    "player": "Alexander Røssing-Lelesiit",
    "id": 1862226,
    "url": "https://api.sofascore.app/api/v1/player/1862226/heatmap/overall",
    "file": "assets/heatmaps/1862226.png"
  },
  {
    "player": "José Sá",
    "id": 252669,
    "url": "https://api.sofascore.app/api/v1/player/252669/heatmap/overall",
    "file": "assets/heatmaps/252669.png"
  },
  {
    "player": "Stefano Sabelli",
    "id": 184421,
    "url": "https://api.sofascore.app/api/v1/player/184421/heatmap/overall",
    "file": "assets/heatmaps/184421.png"
  },
  {
    "player": "Abdelhamid Sabiri",
    "id": 807400,
    "url": "https://api.sofascore.app/api/v1/player/807400/heatmap/overall",
    "file": "assets/heatmaps/807400.png"
  },
  {
    "player": "Marcel Sabitzer",
    "id": 133908,
    "url": "https://api.sofascore.app/api/v1/player/133908/heatmap/overall",
    "file": "assets/heatmaps/133908.png"
  },
  {
    "player": "Noah Sadiki",
    "id": 1171539,
    "url": "https://api.sofascore.app/api/v1/player/1171539/heatmap/overall",
    "file": "assets/heatmaps/1171539.png"
  },
  {
    "player": "Alexis Saelemaekers",
    "id": 901891,
    "url": "https://api.sofascore.app/api/v1/player/901891/heatmap/overall",
    "file": "assets/heatmaps/901891.png"
  },
  {
    "player": "Matvei Safonov",
    "id": 800749,
    "url": "https://api.sofascore.app/api/v1/player/800749/heatmap/overall",
    "file": "assets/heatmaps/800749.png"
  },
  {
    "player": "Osame Sahraoui",
    "id": 965357,
    "url": "https://api.sofascore.app/api/v1/player/965357/heatmap/overall",
    "file": "assets/heatmaps/965357.png"
  },
  {
    "player": "Wesley Saïd",
    "id": 227862,
    "url": "https://api.sofascore.app/api/v1/player/227862/heatmap/overall",
    "file": "assets/heatmaps/227862.png"
  },
  {
    "player": "Allan Saint-Maximin",
    "id": 347010,
    "url": "https://api.sofascore.app/api/v1/player/347010/heatmap/overall",
    "file": "assets/heatmaps/347010.png"
  },
  {
    "player": "Bukayo Saka",
    "id": 934235,
    "url": "https://api.sofascore.app/api/v1/player/934235/heatmap/overall",
    "file": "assets/heatmaps/934235.png"
  },
  {
    "player": "Álex Sala",
    "id": 1157382,
    "url": "https://api.sofascore.app/api/v1/player/1157382/heatmap/overall",
    "file": "assets/heatmaps/1157382.png"
  },
  {
    "player": "Mohamed Salah",
    "id": 159665,
    "url": "https://api.sofascore.app/api/v1/player/159665/heatmap/overall",
    "file": "assets/heatmaps/159665.png"
  },
  {
    "player": "Jan Salas",
    "id": 1905699,
    "url": "https://api.sofascore.app/api/v1/player/1905699/heatmap/overall",
    "file": "assets/heatmaps/1905699.png"
  },
  {
    "player": "Kike Salas",
    "id": 1097719,
    "url": "https://api.sofascore.app/api/v1/player/1097719/heatmap/overall",
    "file": "assets/heatmaps/1097719.png"
  },
  {
    "player": "Manolis Saliakas",
    "id": 280551,
    "url": "https://api.sofascore.app/api/v1/player/280551/heatmap/overall",
    "file": "assets/heatmaps/280551.png"
  },
  {
    "player": "William Saliba",
    "id": 941168,
    "url": "https://api.sofascore.app/api/v1/player/941168/heatmap/overall",
    "file": "assets/heatmaps/941168.png"
  },
  {
    "player": "José Salinas",
    "id": 1068891,
    "url": "https://api.sofascore.app/api/v1/player/1068891/heatmap/overall",
    "file": "assets/heatmaps/1068891.png"
  },
  {
    "player": "Mohammed Salisu",
    "id": 946158,
    "url": "https://api.sofascore.app/api/v1/player/946158/heatmap/overall",
    "file": "assets/heatmaps/946158.png"
  },
  {
    "player": "Lazar Samardzic",
    "id": 980624,
    "url": "https://api.sofascore.app/api/v1/player/980624/heatmap/overall",
    "file": "assets/heatmaps/980624.png"
  },
  {
    "player": "Mbwana Samatta",
    "id": 825088,
    "url": "https://api.sofascore.app/api/v1/player/825088/heatmap/overall",
    "file": "assets/heatmaps/825088.png"
  },
  {
    "player": "Mama Samba Baldé",
    "id": 557166,
    "url": "https://api.sofascore.app/api/v1/player/557166/heatmap/overall",
    "file": "assets/heatmaps/557166.png"
  },
  {
    "player": "Brice Samba",
    "id": 164055,
    "url": "https://api.sofascore.app/api/v1/player/164055/heatmap/overall",
    "file": "assets/heatmaps/164055.png"
  },
  {
    "player": "Albert Sambi Lokonga",
    "id": 901892,
    "url": "https://api.sofascore.app/api/v1/player/901892/heatmap/overall",
    "file": "assets/heatmaps/901892.png"
  },
  {
    "player": "Antonio Sanabria",
    "id": 333261,
    "url": "https://api.sofascore.app/api/v1/player/333261/heatmap/overall",
    "file": "assets/heatmaps/333261.png"
  },
  {
    "player": "Oihan Sancet",
    "id": 966801,
    "url": "https://api.sofascore.app/api/v1/player/966801/heatmap/overall",
    "file": "assets/heatmaps/966801.png"
  },
  {
    "player": "Álex Sánchez",
    "id": 2216007,
    "url": "https://api.sofascore.app/api/v1/player/2216007/heatmap/overall",
    "file": "assets/heatmaps/2216007.png"
  },
  {
    "player": "Alexis Sánchez",
    "id": 34120,
    "url": "https://api.sofascore.app/api/v1/player/34120/heatmap/overall",
    "file": "assets/heatmaps/34120.png"
  },
  {
    "player": "Antonio Sánchez",
    "id": 949722,
    "url": "https://api.sofascore.app/api/v1/player/949722/heatmap/overall",
    "file": "assets/heatmaps/949722.png"
  },
  {
    "player": "Juanlu Sánchez",
    "id": 1010655,
    "url": "https://api.sofascore.app/api/v1/player/1010655/heatmap/overall",
    "file": "assets/heatmaps/1010655.png"
  },
  {
    "player": "Manu Sánchez",
    "id": 984789,
    "url": "https://api.sofascore.app/api/v1/player/984789/heatmap/overall",
    "file": "assets/heatmaps/984789.png"
  },
  {
    "player": "Robert Sánchez",
    "id": 920546,
    "url": "https://api.sofascore.app/api/v1/player/920546/heatmap/overall",
    "file": "assets/heatmaps/920546.png"
  },
  {
    "player": "Selton Sánchez",
    "id": 1953923,
    "url": "https://api.sofascore.app/api/v1/player/1953923/heatmap/overall",
    "file": "assets/heatmaps/1953923.png"
  },
  {
    "player": "Jadon Sancho",
    "id": 851100,
    "url": "https://api.sofascore.app/api/v1/player/851100/heatmap/overall",
    "file": "assets/heatmaps/851100.png"
  },
  {
    "player": "Álex Sancris",
    "id": 1398518,
    "url": "https://api.sofascore.app/api/v1/player/1398518/heatmap/overall",
    "file": "assets/heatmaps/1398518.png"
  },
  {
    "player": "Philipp Sander",
    "id": 939880,
    "url": "https://api.sofascore.app/api/v1/player/939880/heatmap/overall",
    "file": "assets/heatmaps/939880.png"
  },
  {
    "player": "James Sands",
    "id": 885892,
    "url": "https://api.sofascore.app/api/v1/player/885892/heatmap/overall",
    "file": "assets/heatmaps/885892.png"
  },
  {
    "player": "Ibou Sané",
    "id": 1470032,
    "url": "https://api.sofascore.app/api/v1/player/1470032/heatmap/overall",
    "file": "assets/heatmaps/1470032.png"
  },
  {
    "player": "Sadibou Sané",
    "id": 1470032,
    "url": "https://api.sofascore.app/api/v1/player/1470032/heatmap/overall",
    "file": "assets/heatmaps/1470032.png"
  },
  {
    "player": "Arouna Sangante",
    "id": 1035988,
    "url": "https://api.sofascore.app/api/v1/player/1035988/heatmap/overall",
    "file": "assets/heatmaps/1035988.png"
  },
  {
    "player": "Buba Sangaré",
    "id": 1542721,
    "url": "https://api.sofascore.app/api/v1/player/1542721/heatmap/overall",
    "file": "assets/heatmaps/1542721.png"
  },
  {
    "player": "Ibrahim Sangaré",
    "id": 843754,
    "url": "https://api.sofascore.app/api/v1/player/843754/heatmap/overall",
    "file": "assets/heatmaps/843754.png"
  },
  {
    "player": "Mamadou Sangare",
    "id": 1064697,
    "url": "https://api.sofascore.app/api/v1/player/1064697/heatmap/overall",
    "file": "assets/heatmaps/1064697.png"
  },
  {
    "player": "Maroan Sannadi",
    "id": 1520799,
    "url": "https://api.sofascore.app/api/v1/player/1520799/heatmap/overall",
    "file": "assets/heatmaps/1520799.png"
  },
  {
    "player": "Kaishu Sano",
    "id": 1028307,
    "url": "https://api.sofascore.app/api/v1/player/1028307/heatmap/overall",
    "file": "assets/heatmaps/1028307.png"
  },
  {
    "player": "Morgan Sanson",
    "id": 250133,
    "url": "https://api.sofascore.app/api/v1/player/250133/heatmap/overall",
    "file": "assets/heatmaps/250133.png"
  },
  {
    "player": "Baptiste Santamaria",
    "id": 344751,
    "url": "https://api.sofascore.app/api/v1/player/344751/heatmap/overall",
    "file": "assets/heatmaps/344751.png"
  },
  {
    "player": "Yago Santiago",
    "id": 1092515,
    "url": "https://api.sofascore.app/api/v1/player/1092515/heatmap/overall",
    "file": "assets/heatmaps/1092515.png"
  },
  {
    "player": "Alisson Santos",
    "id": 1122835,
    "url": "https://api.sofascore.app/api/v1/player/1122835/heatmap/overall",
    "file": "assets/heatmaps/1122835.png"
  },
  {
    "player": "Andrey Santos",
    "id": 1105779,
    "url": "https://api.sofascore.app/api/v1/player/1105779/heatmap/overall",
    "file": "assets/heatmaps/1105779.png"
  },
  {
    "player": "Kauã Santos",
    "id": 1134203,
    "url": "https://api.sofascore.app/api/v1/player/1134203/heatmap/overall",
    "file": "assets/heatmaps/1134203.png"
  },
  {
    "player": "Tiago Santos",
    "id": 1087364,
    "url": "https://api.sofascore.app/api/v1/player/1087364/heatmap/overall",
    "file": "assets/heatmaps/1087364.png"
  },
  {
    "player": "Amin Sarr",
    "id": 1022204,
    "url": "https://api.sofascore.app/api/v1/player/1022204/heatmap/overall",
    "file": "assets/heatmaps/1022204.png"
  },
  {
    "player": "Bouna Sarr",
    "id": 158233,
    "url": "https://api.sofascore.app/api/v1/player/158233/heatmap/overall",
    "file": "assets/heatmaps/158233.png"
  },
  {
    "player": "Ismaila Sarr",
    "id": 845286,
    "url": "https://api.sofascore.app/api/v1/player/845286/heatmap/overall",
    "file": "assets/heatmaps/845286.png"
  },
  {
    "player": "Malang Sarr",
    "id": 826203,
    "url": "https://api.sofascore.app/api/v1/player/826203/heatmap/overall",
    "file": "assets/heatmaps/826203.png"
  },
  {
    "player": "Mamadou Sarr",
    "id": 1154657,
    "url": "https://api.sofascore.app/api/v1/player/1154657/heatmap/overall",
    "file": "assets/heatmaps/1154657.png"
  },
  {
    "player": "Mario Sauer",
    "id": 1386065,
    "url": "https://api.sofascore.app/api/v1/player/1386065/heatmap/overall",
    "file": "assets/heatmaps/1386065.png"
  },
  {
    "player": "Razvan Sava",
    "id": 1001997,
    "url": "https://api.sofascore.app/api/v1/player/1001997/heatmap/overall",
    "file": "assets/heatmaps/1001997.png"
  },
  {
    "player": "Nicolò Savona",
    "id": 1010220,
    "url": "https://api.sofascore.app/api/v1/player/1010220/heatmap/overall",
    "file": "assets/heatmaps/1010220.png"
  },
  {
    "player": "Giorgio Scalvini",
    "id": 1012176,
    "url": "https://api.sofascore.app/api/v1/player/1012176/heatmap/overall",
    "file": "assets/heatmaps/1012176.png"
  },
  {
    "player": "Gianluca Scamacca",
    "id": 807301,
    "url": "https://api.sofascore.app/api/v1/player/807301/heatmap/overall",
    "file": "assets/heatmaps/807301.png"
  },
  {
    "player": "Oliver Scarles",
    "id": 1150952,
    "url": "https://api.sofascore.app/api/v1/player/1150952/heatmap/overall",
    "file": "assets/heatmaps/1150952.png"
  },
  {
    "player": "Kevin Schade",
    "id": 1006387,
    "url": "https://api.sofascore.app/api/v1/player/1006387/heatmap/overall",
    "file": "assets/heatmaps/1006387.png"
  },
  {
    "player": "András Schäfer",
    "id": 877302,
    "url": "https://api.sofascore.app/api/v1/player/877302/heatmap/overall",
    "file": "assets/heatmaps/877302.png"
  },
  {
    "player": "Fabian Schär",
    "id": 101882,
    "url": "https://api.sofascore.app/api/v1/player/101882/heatmap/overall",
    "file": "assets/heatmaps/101882.png"
  },
  {
    "player": "Fynn Schenten",
    "id": 2245371,
    "url": "https://api.sofascore.app/api/v1/player/2245371/heatmap/overall",
    "file": "assets/heatmaps/2245371.png"
  },
  {
    "player": "Derry Scherhant",
    "id": 1131002,
    "url": "https://api.sofascore.app/api/v1/player/1131002/heatmap/overall",
    "file": "assets/heatmaps/1131002.png"
  },
  {
    "player": "Patrik Schick",
    "id": 280609,
    "url": "https://api.sofascore.app/api/v1/player/280609/heatmap/overall",
    "file": "assets/heatmaps/280609.png"
  },
  {
    "player": "Stefan Schimmer",
    "id": 842922,
    "url": "https://api.sofascore.app/api/v1/player/842922/heatmap/overall",
    "file": "assets/heatmaps/842922.png"
  },
  {
    "player": "Xaver Schlager",
    "id": 791079,
    "url": "https://api.sofascore.app/api/v1/player/791079/heatmap/overall",
    "file": "assets/heatmaps/791079.png"
  },
  {
    "player": "Keven Schlotterbeck",
    "id": 891651,
    "url": "https://api.sofascore.app/api/v1/player/891651/heatmap/overall",
    "file": "assets/heatmaps/891651.png"
  },
  {
    "player": "Nico Schlotterbeck",
    "id": 940871,
    "url": "https://api.sofascore.app/api/v1/player/940871/heatmap/overall",
    "file": "assets/heatmaps/940871.png"
  },
  {
    "player": "Mick Schmetgens",
    "id": 1568521,
    "url": "https://api.sofascore.app/api/v1/player/1568521/heatmap/overall",
    "file": "assets/heatmaps/1568521.png"
  },
  {
    "player": "Romano Schmid",
    "id": 830127,
    "url": "https://api.sofascore.app/api/v1/player/830127/heatmap/overall",
    "file": "assets/heatmaps/830127.png"
  },
  {
    "player": "Isaac Schmidt",
    "id": 1015164,
    "url": "https://api.sofascore.app/api/v1/player/1015164/heatmap/overall",
    "file": "assets/heatmaps/1015164.png"
  },
  {
    "player": "Joël Schmied",
    "id": 965950,
    "url": "https://api.sofascore.app/api/v1/player/965950/heatmap/overall",
    "file": "assets/heatmaps/965950.png"
  },
  {
    "player": "Jan Schöppner",
    "id": 933707,
    "url": "https://api.sofascore.app/api/v1/player/933707/heatmap/overall",
    "file": "assets/heatmaps/933707.png"
  },
  {
    "player": "Marvin Schwäbe",
    "id": 187185,
    "url": "https://api.sofascore.app/api/v1/player/187185/heatmap/overall",
    "file": "assets/heatmaps/187185.png"
  },
  {
    "player": "Alex Scott",
    "id": 1104986,
    "url": "https://api.sofascore.app/api/v1/player/1104986/heatmap/overall",
    "file": "assets/heatmaps/1104986.png"
  },
  {
    "player": "Simone Scuffet",
    "id": 284349,
    "url": "https://api.sofascore.app/api/v1/player/284349/heatmap/overall",
    "file": "assets/heatmaps/284349.png"
  },
  {
    "player": "Sebastian Sebulonsen",
    "id": 1020206,
    "url": "https://api.sofascore.app/api/v1/player/1020206/heatmap/overall",
    "file": "assets/heatmaps/1020206.png"
  },
  {
    "player": "Alidu Seidu",
    "id": 1049515,
    "url": "https://api.sofascore.app/api/v1/player/1049515/heatmap/overall",
    "file": "assets/heatmaps/1049515.png"
  },
  {
    "player": "Nicolas Seiwald",
    "id": 976575,
    "url": "https://api.sofascore.app/api/v1/player/976575/heatmap/overall",
    "file": "assets/heatmaps/976575.png"
  },
  {
    "player": "Ayumu Seko",
    "id": 873221,
    "url": "https://api.sofascore.app/api/v1/player/873221/heatmap/overall",
    "file": "assets/heatmaps/873221.png"
  },
  {
    "player": "Matz Sels",
    "id": 78152,
    "url": "https://api.sofascore.app/api/v1/player/78152/heatmap/overall",
    "file": "assets/heatmaps/78152.png"
  },
  {
    "player": "Antoine Semenyo",
    "id": 934354,
    "url": "https://api.sofascore.app/api/v1/player/934354/heatmap/overall",
    "file": "assets/heatmaps/934354.png"
  },
  {
    "player": "Adrian Šemper",
    "id": 814876,
    "url": "https://api.sofascore.app/api/v1/player/814876/heatmap/overall",
    "file": "assets/heatmaps/814876.png"
  },
  {
    "player": "Marvin Senaya",
    "id": 1087805,
    "url": "https://api.sofascore.app/api/v1/player/1087805/heatmap/overall",
    "file": "assets/heatmaps/1087805.png"
  },
  {
    "player": "Marcos Senesi",
    "id": 830659,
    "url": "https://api.sofascore.app/api/v1/player/830659/heatmap/overall",
    "file": "assets/heatmaps/830659.png"
  },
  {
    "player": "Suat Serdar",
    "id": 800408,
    "url": "https://api.sofascore.app/api/v1/player/800408/heatmap/overall",
    "file": "assets/heatmaps/800408.png"
  },
  {
    "player": "Benjamin Šeško",
    "id": 986397,
    "url": "https://api.sofascore.app/api/v1/player/986397/heatmap/overall",
    "file": "assets/heatmaps/986397.png"
  },
  {
    "player": "Ryan Sessegnon",
    "id": 836698,
    "url": "https://api.sofascore.app/api/v1/player/836698/heatmap/overall",
    "file": "assets/heatmaps/836698.png"
  },
  {
    "player": "Stephan El Shaarawy",
    "id": 45925,
    "url": "https://api.sofascore.app/api/v1/player/45925/heatmap/overall",
    "file": "assets/heatmaps/45925.png"
  },
  {
    "player": "Luke Shaw",
    "id": 190839,
    "url": "https://api.sofascore.app/api/v1/player/190839/heatmap/overall",
    "file": "assets/heatmaps/190839.png"
  },
  {
    "player": "Kento Shiogai",
    "id": 1499696,
    "url": "https://api.sofascore.app/api/v1/player/1499696/heatmap/overall",
    "file": "assets/heatmaps/1499696.png"
  },
  {
    "player": "Kwasi Sibo",
    "id": 905639,
    "url": "https://api.sofascore.app/api/v1/player/905639/heatmap/overall",
    "file": "assets/heatmaps/905639.png"
  },
  {
    "player": "Djibril Sidibé",
    "id": 123388,
    "url": "https://api.sofascore.app/api/v1/player/123388/heatmap/overall",
    "file": "assets/heatmaps/123388.png"
  },
  {
    "player": "Armindo Sieb",
    "id": 1005834,
    "url": "https://api.sofascore.app/api/v1/player/1005834/heatmap/overall",
    "file": "assets/heatmaps/1005834.png"
  },
  {
    "player": "Jamil Siebert",
    "id": 1014287,
    "url": "https://api.sofascore.app/api/v1/player/1014287/heatmap/overall",
    "file": "assets/heatmaps/1014287.png"
  },
  {
    "player": "Francisco Sierralta",
    "id": 805096,
    "url": "https://api.sofascore.app/api/v1/player/805096/heatmap/overall",
    "file": "assets/heatmaps/805096.png"
  },
  {
    "player": "Tim Siersleben",
    "id": 988252,
    "url": "https://api.sofascore.app/api/v1/player/988252/heatmap/overall",
    "file": "assets/heatmaps/988252.png"
  },
  {
    "player": "Mathys Silestrie",
    "id": 1513605,
    "url": "https://api.sofascore.app/api/v1/player/1513605/heatmap/overall",
    "file": "assets/heatmaps/1513605.png"
  },
  {
    "player": "André Silva",
    "id": 190159,
    "url": "https://api.sofascore.app/api/v1/player/190159/heatmap/overall",
    "file": "assets/heatmaps/190159.png"
  },
  {
    "player": "Bernardo Silva",
    "id": 331209,
    "url": "https://api.sofascore.app/api/v1/player/331209/heatmap/overall",
    "file": "assets/heatmaps/331209.png"
  },
  {
    "player": "Caio Henrique Oliveira Silva",
    "id": 845170,
    "url": "https://api.sofascore.app/api/v1/player/845170/heatmap/overall",
    "file": "assets/heatmaps/845170.png"
  },
  {
    "player": "Fábio Silva",
    "id": 954076,
    "url": "https://api.sofascore.app/api/v1/player/954076/heatmap/overall",
    "file": "assets/heatmaps/954076.png"
  },
  {
    "player": "Marco Silvestri",
    "id": 43970,
    "url": "https://api.sofascore.app/api/v1/player/43970/heatmap/overall",
    "file": "assets/heatmaps/43970.png"
  },
  {
    "player": "Abdallah Sima",
    "id": 1029018,
    "url": "https://api.sofascore.app/api/v1/player/1029018/heatmap/overall",
    "file": "assets/heatmaps/1029018.png"
  },
  {
    "player": "Giovanni Simeone",
    "id": 341143,
    "url": "https://api.sofascore.app/api/v1/player/341143/heatmap/overall",
    "file": "assets/heatmaps/341143.png"
  },
  {
    "player": "Giuliano Simeone",
    "id": 1099352,
    "url": "https://api.sofascore.app/api/v1/player/1099352/heatmap/overall",
    "file": "assets/heatmaps/1099352.png"
  },
  {
    "player": "Unai Simón",
    "id": 797291,
    "url": "https://api.sofascore.app/api/v1/player/797291/heatmap/overall",
    "file": "assets/heatmaps/797291.png"
  },
  {
    "player": "Jahmai Simpson-Pusey",
    "id": 1402924,
    "url": "https://api.sofascore.app/api/v1/player/1402924/heatmap/overall",
    "file": "assets/heatmaps/1402924.png"
  },
  {
    "player": "Danel Sinani",
    "id": 887500,
    "url": "https://api.sofascore.app/api/v1/player/887500/heatmap/overall",
    "file": "assets/heatmaps/887500.png"
  },
  {
    "player": "Dan Sinaté",
    "id": 1493480,
    "url": "https://api.sofascore.app/api/v1/player/1493480/heatmap/overall",
    "file": "assets/heatmaps/1493480.png"
  },
  {
    "player": "Lassine Sinayoko",
    "id": 927005,
    "url": "https://api.sofascore.app/api/v1/player/927005/heatmap/overall",
    "file": "assets/heatmaps/927005.png"
  },
  {
    "player": "Ibrahima Sissoko",
    "id": 829093,
    "url": "https://api.sofascore.app/api/v1/player/829093/heatmap/overall",
    "file": "assets/heatmaps/829093.png"
  },
  {
    "player": "Antonio Sivera",
    "id": 369004,
    "url": "https://api.sofascore.app/api/v1/player/369004/heatmap/overall",
    "file": "assets/heatmaps/369004.png"
  },
  {
    "player": "Telli Siwe",
    "id": 1897492,
    "url": "https://api.sofascore.app/api/v1/player/1897492/heatmap/overall",
    "file": "assets/heatmaps/1897492.png"
  },
  {
    "player": "Tim Skarke",
    "id": 800252,
    "url": "https://api.sofascore.app/api/v1/player/800252/heatmap/overall",
    "file": "assets/heatmaps/800252.png"
  },
  {
    "player": "Ellyes Skhiri",
    "id": 591706,
    "url": "https://api.sofascore.app/api/v1/player/591706/heatmap/overall",
    "file": "assets/heatmaps/591706.png"
  },
  {
    "player": "Leo Skiri Østigård",
    "id": 879746,
    "url": "https://api.sofascore.app/api/v1/player/879746/heatmap/overall",
    "file": "assets/heatmaps/879746.png"
  },
  {
    "player": "Łukasz Skorupski",
    "id": 44906,
    "url": "https://api.sofascore.app/api/v1/player/44906/heatmap/overall",
    "file": "assets/heatmaps/44906.png"
  },
  {
    "player": "Robert Skov",
    "id": 327863,
    "url": "https://api.sofascore.app/api/v1/player/327863/heatmap/overall",
    "file": "assets/heatmaps/327863.png"
  },
  {
    "player": "Tobias Slotsager",
    "id": 1133236,
    "url": "https://api.sofascore.app/api/v1/player/1133236/heatmap/overall",
    "file": "assets/heatmaps/1133236.png"
  },
  {
    "player": "Adam Smith",
    "id": 44566,
    "url": "https://api.sofascore.app/api/v1/player/44566/heatmap/overall",
    "file": "assets/heatmaps/44566.png"
  },
  {
    "player": "Eric Smith",
    "id": 542038,
    "url": "https://api.sofascore.app/api/v1/player/542038/heatmap/overall",
    "file": "assets/heatmaps/542038.png"
  },
  {
    "player": "Emile Smith Rowe",
    "id": 867445,
    "url": "https://api.sofascore.app/api/v1/player/867445/heatmap/overall",
    "file": "assets/heatmaps/867445.png"
  },
  {
    "player": "Ivan Smolčić",
    "id": 974581,
    "url": "https://api.sofascore.app/api/v1/player/974581/heatmap/overall",
    "file": "assets/heatmaps/974581.png"
  },
  {
    "player": "Dominic Solanke",
    "id": 361420,
    "url": "https://api.sofascore.app/api/v1/player/361420/heatmap/overall",
    "file": "assets/heatmaps/361420.png"
  },
  {
    "player": "Carlos Soler",
    "id": 832427,
    "url": "https://api.sofascore.app/api/v1/player/832427/heatmap/overall",
    "file": "assets/heatmaps/832427.png"
  },
  {
    "player": "Julio Soler",
    "id": 1201520,
    "url": "https://api.sofascore.app/api/v1/player/1201520/heatmap/overall",
    "file": "assets/heatmaps/1201520.png"
  },
  {
    "player": "Oumar Solet",
    "id": 892979,
    "url": "https://api.sofascore.app/api/v1/player/892979/heatmap/overall",
    "file": "assets/heatmaps/892979.png"
  },
  {
    "player": "Manor Solomon",
    "id": 862223,
    "url": "https://api.sofascore.app/api/v1/player/862223/heatmap/overall",
    "file": "assets/heatmaps/862223.png"
  },
  {
    "player": "Hugo Solozabal",
    "id": 1429059,
    "url": "https://api.sofascore.app/api/v1/player/1429059/heatmap/overall",
    "file": "assets/heatmaps/1429059.png"
  },
  {
    "player": "Daniele Sommariva",
    "id": 595572,
    "url": "https://api.sofascore.app/api/v1/player/595572/heatmap/overall",
    "file": "assets/heatmaps/595572.png"
  },
  {
    "player": "Yann Sommer",
    "id": 16206,
    "url": "https://api.sofascore.app/api/v1/player/16206/heatmap/overall",
    "file": "assets/heatmaps/16206.png"
  },
  {
    "player": "David Soria",
    "id": 604258,
    "url": "https://api.sofascore.app/api/v1/player/604258/heatmap/overall",
    "file": "assets/heatmaps/604258.png"
  },
  {
    "player": "Borna Sosa",
    "id": 357584,
    "url": "https://api.sofascore.app/api/v1/player/357584/heatmap/overall",
    "file": "assets/heatmaps/357584.png"
  },
  {
    "player": "Hugo Sotelo",
    "id": 1120669,
    "url": "https://api.sofascore.app/api/v1/player/1120669/heatmap/overall",
    "file": "assets/heatmaps/1120669.png"
  },
  {
    "player": "Florian Sotoca",
    "id": 788921,
    "url": "https://api.sofascore.app/api/v1/player/788921/heatmap/overall",
    "file": "assets/heatmaps/788921.png"
  },
  {
    "player": "Riccardo Sottil",
    "id": 893640,
    "url": "https://api.sofascore.app/api/v1/player/893640/heatmap/overall",
    "file": "assets/heatmaps/893640.png"
  },
  {
    "player": "Tomáš Souček",
    "id": 799041,
    "url": "https://api.sofascore.app/api/v1/player/799041/heatmap/overall",
    "file": "assets/heatmaps/799041.png"
  },
  {
    "player": "Matìas Soulé",
    "id": 1082406,
    "url": "https://api.sofascore.app/api/v1/player/1082406/heatmap/overall",
    "file": "assets/heatmaps/1082406.png"
  },
  {
    "player": "Sambou Soumano",
    "id": 1103141,
    "url": "https://api.sofascore.app/api/v1/player/1103141/heatmap/overall",
    "file": "assets/heatmaps/1103141.png"
  },
  {
    "player": "Issa Soumaré",
    "id": 1001458,
    "url": "https://api.sofascore.app/api/v1/player/1001458/heatmap/overall",
    "file": "assets/heatmaps/1001458.png"
  },
  {
    "player": "Souza",
    "id": 1482340,
    "url": "https://api.sofascore.app/api/v1/player/1482340/heatmap/overall",
    "file": "assets/heatmaps/1482340.png"
  },
  {
    "player": "Vinicius Souza",
    "id": 979290,
    "url": "https://api.sofascore.app/api/v1/player/979290/heatmap/overall",
    "file": "assets/heatmaps/979290.png"
  },
  {
    "player": "Djibril Sow",
    "id": 799054,
    "url": "https://api.sofascore.app/api/v1/player/799054/heatmap/overall",
    "file": "assets/heatmaps/799054.png"
  },
  {
    "player": "Djed Spence",
    "id": 945798,
    "url": "https://api.sofascore.app/api/v1/player/945798/heatmap/overall",
    "file": "assets/heatmaps/945798.png"
  },
  {
    "player": "Leonardo Spinazzola",
    "id": 148899,
    "url": "https://api.sofascore.app/api/v1/player/148899/heatmap/overall",
    "file": "assets/heatmaps/148899.png"
  },
  {
    "player": "Anton Stach",
    "id": 889861,
    "url": "https://api.sofascore.app/api/v1/player/889861/heatmap/overall",
    "file": "assets/heatmaps/889861.png"
  },
  {
    "player": "Jens Stage",
    "id": 830142,
    "url": "https://api.sofascore.app/api/v1/player/830142/heatmap/overall",
    "file": "assets/heatmaps/830142.png"
  },
  {
    "player": "Benjamin Stambouli",
    "id": 105951,
    "url": "https://api.sofascore.app/api/v1/player/105951/heatmap/overall",
    "file": "assets/heatmaps/105951.png"
  },
  {
    "player": "Otto Stange",
    "id": 1568535,
    "url": "https://api.sofascore.app/api/v1/player/1568535/heatmap/overall",
    "file": "assets/heatmaps/1568535.png"
  },
  {
    "player": "Josip Stanišić",
    "id": 927407,
    "url": "https://api.sofascore.app/api/v1/player/927407/heatmap/overall",
    "file": "assets/heatmaps/927407.png"
  },
  {
    "player": "Carl Starfelt",
    "id": 360718,
    "url": "https://api.sofascore.app/api/v1/player/360718/heatmap/overall",
    "file": "assets/heatmaps/360718.png"
  },
  {
    "player": "Niklas Stark",
    "id": 229544,
    "url": "https://api.sofascore.app/api/v1/player/229544/heatmap/overall",
    "file": "assets/heatmaps/229544.png"
  },
  {
    "player": "Orri Steinn Óskarsson",
    "id": 1026015,
    "url": "https://api.sofascore.app/api/v1/player/1026015/heatmap/overall",
    "file": "assets/heatmaps/1026015.png"
  },
  {
    "player": "Calvin Stengs",
    "id": 857480,
    "url": "https://api.sofascore.app/api/v1/player/857480/heatmap/overall",
    "file": "assets/heatmaps/857480.png"
  },
  {
    "player": "Pascal Stenzel",
    "id": 352562,
    "url": "https://api.sofascore.app/api/v1/player/352562/heatmap/overall",
    "file": "assets/heatmaps/352562.png"
  },
  {
    "player": "Angelo Stiller",
    "id": 901882,
    "url": "https://api.sofascore.app/api/v1/player/901882/heatmap/overall",
    "file": "assets/heatmaps/901882.png"
  },
  {
    "player": "Kevin Stöger",
    "id": 95381,
    "url": "https://api.sofascore.app/api/v1/player/95381/heatmap/overall",
    "file": "assets/heatmaps/95381.png"
  },
  {
    "player": "Filip Stojilković",
    "id": 959003,
    "url": "https://api.sofascore.app/api/v1/player/959003/heatmap/overall",
    "file": "assets/heatmaps/959003.png"
  },
  {
    "player": "John Stones",
    "id": 152077,
    "url": "https://api.sofascore.app/api/v1/player/152077/heatmap/overall",
    "file": "assets/heatmaps/152077.png"
  },
  {
    "player": "Gabriel Strefezza",
    "id": 877201,
    "url": "https://api.sofascore.app/api/v1/player/877201/heatmap/overall",
    "file": "assets/heatmaps/877201.png"
  },
  {
    "player": "Pascal Struijk",
    "id": 836675,
    "url": "https://api.sofascore.app/api/v1/player/836675/heatmap/overall",
    "file": "assets/heatmaps/836675.png"
  },
  {
    "player": "Cristhian Stuani",
    "id": 32048,
    "url": "https://api.sofascore.app/api/v1/player/32048/heatmap/overall",
    "file": "assets/heatmaps/32048.png"
  },
  {
    "player": "Nikola Štulić",
    "id": 1029748,
    "url": "https://api.sofascore.app/api/v1/player/1029748/heatmap/overall",
    "file": "assets/heatmaps/1029748.png"
  },
  {
    "player": "Denis Suárez",
    "id": 138383,
    "url": "https://api.sofascore.app/api/v1/player/138383/heatmap/overall",
    "file": "assets/heatmaps/138383.png"
  },
  {
    "player": "Gabriel Suazo",
    "id": 818986,
    "url": "https://api.sofascore.app/api/v1/player/818986/heatmap/overall",
    "file": "assets/heatmaps/818986.png"
  },
  {
    "player": "Luka Sučić",
    "id": 949156,
    "url": "https://api.sofascore.app/api/v1/player/949156/heatmap/overall",
    "file": "assets/heatmaps/949156.png"
  },
  {
    "player": "Petar Sucic",
    "id": 1091303,
    "url": "https://api.sofascore.app/api/v1/player/1091303/heatmap/overall",
    "file": "assets/heatmaps/1091303.png"
  },
  {
    "player": "Yukinari Sugawara",
    "id": 905347,
    "url": "https://api.sofascore.app/api/v1/player/905347/heatmap/overall",
    "file": "assets/heatmaps/905347.png"
  },
  {
    "player": "Pavel Šulc",
    "id": 957604,
    "url": "https://api.sofascore.app/api/v1/player/957604/heatmap/overall",
    "file": "assets/heatmaps/957604.png"
  },
  {
    "player": "Niklas Süle",
    "id": 168937,
    "url": "https://api.sofascore.app/api/v1/player/168937/heatmap/overall",
    "file": "assets/heatmaps/168937.png"
  },
  {
    "player": "Ibrahim Sulemana",
    "id": 105905,
    "url": "https://api.sofascore.app/api/v1/player/105905/heatmap/overall",
    "file": "assets/heatmaps/105905.png"
  },
  {
    "player": "Kamaldeen Sulemana",
    "id": 1019442,
    "url": "https://api.sofascore.app/api/v1/player/1019442/heatmap/overall",
    "file": "assets/heatmaps/1019442.png"
  },
  {
    "player": "Crysencio Summerville",
    "id": 917005,
    "url": "https://api.sofascore.app/api/v1/player/917005/heatmap/overall",
    "file": "assets/heatmaps/917005.png"
  },
  {
    "player": "Tomáš Suslov",
    "id": 964154,
    "url": "https://api.sofascore.app/api/v1/player/964154/heatmap/overall",
    "file": "assets/heatmaps/964154.png"
  },
  {
    "player": "Yuito Suzuki",
    "id": 1020422,
    "url": "https://api.sofascore.app/api/v1/player/1020422/heatmap/overall",
    "file": "assets/heatmaps/1020422.png"
  },
  {
    "player": "Zion Suzuki",
    "id": 905351,
    "url": "https://api.sofascore.app/api/v1/player/905351/heatmap/overall",
    "file": "assets/heatmaps/905351.png"
  },
  {
    "player": "Mattias Svanberg",
    "id": 796987,
    "url": "https://api.sofascore.app/api/v1/player/796987/heatmap/overall",
    "file": "assets/heatmaps/796987.png"
  },
  {
    "player": "Daniel Svensson",
    "id": 1021272,
    "url": "https://api.sofascore.app/api/v1/player/1021272/heatmap/overall",
    "file": "assets/heatmaps/1021272.png"
  },
  {
    "player": "Mile Svilar",
    "id": 793986,
    "url": "https://api.sofascore.app/api/v1/player/793986/heatmap/overall",
    "file": "assets/heatmaps/793986.png"
  },
  {
    "player": "Williot Swedberg",
    "id": 1126779,
    "url": "https://api.sofascore.app/api/v1/player/1126779/heatmap/overall",
    "file": "assets/heatmaps/1126779.png"
  },
  {
    "player": "Lamine Sy",
    "id": 1177351,
    "url": "https://api.sofascore.app/api/v1/player/1177351/heatmap/overall",
    "file": "assets/heatmaps/1177351.png"
  },
  {
    "player": "Abakar Sylla",
    "id": 1170197,
    "url": "https://api.sofascore.app/api/v1/player/1170197/heatmap/overall",
    "file": "assets/heatmaps/1170197.png"
  },
  {
    "player": "Fodé Sylla",
    "id": 1426222,
    "url": "https://api.sofascore.app/api/v1/player/1426222/heatmap/overall",
    "file": "assets/heatmaps/1426222.png"
  },
  {
    "player": "Wojciech Szczęsny",
    "id": 50490,
    "url": "https://api.sofascore.app/api/v1/player/50490/heatmap/overall",
    "file": "assets/heatmaps/50490.png"
  },
  {
    "player": "Dominik Szoboszlai",
    "id": 869856,
    "url": "https://api.sofascore.app/api/v1/player/869856/heatmap/overall",
    "file": "assets/heatmaps/869856.png"
  },
  {
    "player": "Sebastian Szymański",
    "id": 847983,
    "url": "https://api.sofascore.app/api/v1/player/847983/heatmap/overall",
    "file": "assets/heatmaps/847983.png"
  },
  {
    "player": "Alexander Sørloth",
    "id": 309078,
    "url": "https://api.sofascore.app/api/v1/player/309078/heatmap/overall",
    "file": "assets/heatmaps/309078.png"
  },
  {
    "player": "Jocelin Ta Bi",
    "id": 2138729,
    "url": "https://api.sofascore.app/api/v1/player/2138729/heatmap/overall",
    "file": "assets/heatmaps/2138729.png"
  },
  {
    "player": "Haris Tabakovic",
    "id": 259803,
    "url": "https://api.sofascore.app/api/v1/player/259803/heatmap/overall",
    "file": "assets/heatmaps/259803.png"
  },
  {
    "player": "Nicolás Tagliafico",
    "id": 158243,
    "url": "https://api.sofascore.app/api/v1/player/158243/heatmap/overall",
    "file": "assets/heatmaps/158243.png"
  },
  {
    "player": "Jonathan Tah",
    "id": 227672,
    "url": "https://api.sofascore.app/api/v1/player/227672/heatmap/overall",
    "file": "assets/heatmaps/227672.png"
  },
  {
    "player": "Kōta Takai",
    "id": 1144143,
    "url": "https://api.sofascore.app/api/v1/player/1144143/heatmap/overall",
    "file": "assets/heatmaps/1144143.png"
  },
  {
    "player": "Chemsdine Talbi",
    "id": 1142675,
    "url": "https://api.sofascore.app/api/v1/player/1142675/heatmap/overall",
    "file": "assets/heatmaps/1142675.png"
  },
  {
    "player": "Montassar Talbi",
    "id": 879618,
    "url": "https://api.sofascore.app/api/v1/player/879618/heatmap/overall",
    "file": "assets/heatmaps/879618.png"
  },
  {
    "player": "Adrien Tameze",
    "id": 139235,
    "url": "https://api.sofascore.app/api/v1/player/139235/heatmap/overall",
    "file": "assets/heatmaps/139235.png"
  },
  {
    "player": "Ao Tanaka",
    "id": 871886,
    "url": "https://api.sofascore.app/api/v1/player/871886/heatmap/overall",
    "file": "assets/heatmaps/871886.png"
  },
  {
    "player": "Axel Tapé",
    "id": 1937795,
    "url": "https://api.sofascore.app/api/v1/player/1937795/heatmap/overall",
    "file": "assets/heatmaps/1937795.png"
  },
  {
    "player": "Edmond Tapsoba",
    "id": 883262,
    "url": "https://api.sofascore.app/api/v1/player/883262/heatmap/overall",
    "file": "assets/heatmaps/883262.png"
  },
  {
    "player": "James Tarkowski",
    "id": 145188,
    "url": "https://api.sofascore.app/api/v1/player/145188/heatmap/overall",
    "file": "assets/heatmaps/145188.png"
  },
  {
    "player": "César Tárrega",
    "id": 996928,
    "url": "https://api.sofascore.app/api/v1/player/996928/heatmap/overall",
    "file": "assets/heatmaps/996928.png"
  },
  {
    "player": "Tylel Tati",
    "id": 2193204,
    "url": "https://api.sofascore.app/api/v1/player/2193204/heatmap/overall",
    "file": "assets/heatmaps/2193204.png"
  },
  {
    "player": "Nuno Tavares",
    "id": 944973,
    "url": "https://api.sofascore.app/api/v1/player/944973/heatmap/overall",
    "file": "assets/heatmaps/944973.png"
  },
  {
    "player": "Marcus Tavernier",
    "id": 895576,
    "url": "https://api.sofascore.app/api/v1/player/895576/heatmap/overall",
    "file": "assets/heatmaps/895576.png"
  },
  {
    "player": "Kenneth Taylor",
    "id": 959806,
    "url": "https://api.sofascore.app/api/v1/player/959806/heatmap/overall",
    "file": "assets/heatmaps/959806.png"
  },
  {
    "player": "Loum Tchaouna",
    "id": 1004505,
    "url": "https://api.sofascore.app/api/v1/player/1004505/heatmap/overall",
    "file": "assets/heatmaps/1004505.png"
  },
  {
    "player": "Jackson Tchatchoua",
    "id": 1096210,
    "url": "https://api.sofascore.app/api/v1/player/1096210/heatmap/overall",
    "file": "assets/heatmaps/1096210.png"
  },
  {
    "player": "Aurélien Tchouaméni",
    "id": 859025,
    "url": "https://api.sofascore.app/api/v1/player/859025/heatmap/overall",
    "file": "assets/heatmaps/859025.png"
  },
  {
    "player": "Mathys Tel",
    "id": 1048888,
    "url": "https://api.sofascore.app/api/v1/player/1048888/heatmap/overall",
    "file": "assets/heatmaps/1048888.png"
  },
  {
    "player": "Nathan Tella",
    "id": 920379,
    "url": "https://api.sofascore.app/api/v1/player/920379/heatmap/overall",
    "file": "assets/heatmaps/920379.png"
  },
  {
    "player": "Nahuel Tenaglia",
    "id": 896073,
    "url": "https://api.sofascore.app/api/v1/player/896073/heatmap/overall",
    "file": "assets/heatmaps/896073.png"
  },
  {
    "player": "Arnau Tenas",
    "id": 908714,
    "url": "https://api.sofascore.app/api/v1/player/908714/heatmap/overall",
    "file": "assets/heatmaps/908714.png"
  },
  {
    "player": "Marc-André ter Stegen",
    "id": 88625,
    "url": "https://api.sofascore.app/api/v1/player/88625/heatmap/overall",
    "file": "assets/heatmaps/88625.png"
  },
  {
    "player": "Filippo Terracciano",
    "id": 1034303,
    "url": "https://api.sofascore.app/api/v1/player/1034303/heatmap/overall",
    "file": "assets/heatmaps/1034303.png"
  },
  {
    "player": "Pietro Terracciano",
    "id": 136856,
    "url": "https://api.sofascore.app/api/v1/player/136856/heatmap/overall",
    "file": "assets/heatmaps/136856.png"
  },
  {
    "player": "Ramón Terrats",
    "id": 1088565,
    "url": "https://api.sofascore.app/api/v1/player/1088565/heatmap/overall",
    "file": "assets/heatmaps/1088565.png"
  },
  {
    "player": "Martin Terrier",
    "id": 846445,
    "url": "https://api.sofascore.app/api/v1/player/846445/heatmap/overall",
    "file": "assets/heatmaps/846445.png"
  },
  {
    "player": "Tanner Tessmann",
    "id": 1022084,
    "url": "https://api.sofascore.app/api/v1/player/1022084/heatmap/overall",
    "file": "assets/heatmaps/1022084.png"
  },
  {
    "player": "Kenny Tete",
    "id": 190877,
    "url": "https://api.sofascore.app/api/v1/player/190877/heatmap/overall",
    "file": "assets/heatmaps/190877.png"
  },
  {
    "player": "Jordan Teze",
    "id": 825846,
    "url": "https://api.sofascore.app/api/v1/player/825846/heatmap/overall",
    "file": "assets/heatmaps/825846.png"
  },
  {
    "player": "Florian Thauvin",
    "id": 148824,
    "url": "https://api.sofascore.app/api/v1/player/148824/heatmap/overall",
    "file": "assets/heatmaps/148824.png"
  },
  {
    "player": "Arthur Theate",
    "id": 965778,
    "url": "https://api.sofascore.app/api/v1/player/965778/heatmap/overall",
    "file": "assets/heatmaps/965778.png"
  },
  {
    "player": "Thiago",
    "id": 1016907,
    "url": "https://api.sofascore.app/api/v1/player/1016907/heatmap/overall",
    "file": "assets/heatmaps/1016907.png"
  },
  {
    "player": "Malick Thiaw",
    "id": 1014286,
    "url": "https://api.sofascore.app/api/v1/player/1014286/heatmap/overall",
    "file": "assets/heatmaps/1014286.png"
  },
  {
    "player": "Jan Thielmann",
    "id": 1010726,
    "url": "https://api.sofascore.app/api/v1/player/1010726/heatmap/overall",
    "file": "assets/heatmaps/1010726.png"
  },
  {
    "player": "Adrien Thomasson",
    "id": 231946,
    "url": "https://api.sofascore.app/api/v1/player/231946/heatmap/overall",
    "file": "assets/heatmaps/231946.png"
  },
  {
    "player": "Morten Thorsby",
    "id": 280991,
    "url": "https://api.sofascore.app/api/v1/player/280991/heatmap/overall",
    "file": "assets/heatmaps/280991.png"
  },
  {
    "player": "Kristian Thorstvedt",
    "id": 924973,
    "url": "https://api.sofascore.app/api/v1/player/924973/heatmap/overall",
    "file": "assets/heatmaps/924973.png"
  },
  {
    "player": "Khéphren Thuram",
    "id": 904832,
    "url": "https://api.sofascore.app/api/v1/player/904832/heatmap/overall",
    "file": "assets/heatmaps/904832.png"
  },
  {
    "player": "Marcus Thuram",
    "id": 791702,
    "url": "https://api.sofascore.app/api/v1/player/791702/heatmap/overall",
    "file": "assets/heatmaps/791702.png"
  },
  {
    "player": "Youri Tielemans",
    "id": 331737,
    "url": "https://api.sofascore.app/api/v1/player/331737/heatmap/overall",
    "file": "assets/heatmaps/331737.png"
  },
  {
    "player": "Phillip Tietz",
    "id": 822340,
    "url": "https://api.sofascore.app/api/v1/player/822340/heatmap/overall",
    "file": "assets/heatmaps/822340.png"
  },
  {
    "player": "Malik Tillman",
    "id": 975798,
    "url": "https://api.sofascore.app/api/v1/player/975798/heatmap/overall",
    "file": "assets/heatmaps/975798.png"
  },
  {
    "player": "Jurriën Timber",
    "id": 958959,
    "url": "https://api.sofascore.app/api/v1/player/958959/heatmap/overall",
    "file": "assets/heatmaps/958959.png"
  },
  {
    "player": "Quinten Timber",
    "id": 959805,
    "url": "https://api.sofascore.app/api/v1/player/959805/heatmap/overall",
    "file": "assets/heatmaps/959805.png"
  },
  {
    "player": "Jean-Clair Todibo",
    "id": 945217,
    "url": "https://api.sofascore.app/api/v1/player/945217/heatmap/overall",
    "file": "assets/heatmaps/945217.png"
  },
  {
    "player": "Corentin Tolisso",
    "id": 343067,
    "url": "https://api.sofascore.app/api/v1/player/343067/heatmap/overall",
    "file": "assets/heatmaps/343067.png"
  },
  {
    "player": "Jeremy Toljan",
    "id": 149606,
    "url": "https://api.sofascore.app/api/v1/player/149606/heatmap/overall",
    "file": "assets/heatmaps/149606.png"
  },
  {
    "player": "Tiago Tomás",
    "id": 983540,
    "url": "https://api.sofascore.app/api/v1/player/983540/heatmap/overall",
    "file": "assets/heatmaps/983540.png"
  },
  {
    "player": "Fikayo Tomori",
    "id": 788255,
    "url": "https://api.sofascore.app/api/v1/player/788255/heatmap/overall",
    "file": "assets/heatmaps/788255.png"
  },
  {
    "player": "Sandro Tonali",
    "id": 892673,
    "url": "https://api.sofascore.app/api/v1/player/892673/heatmap/overall",
    "file": "assets/heatmaps/892673.png"
  },
  {
    "player": "Keke Topp",
    "id": 1166832,
    "url": "https://api.sofascore.app/api/v1/player/1166832/heatmap/overall",
    "file": "assets/heatmaps/1166832.png"
  },
  {
    "player": "Pablo Torre",
    "id": 1082981,
    "url": "https://api.sofascore.app/api/v1/player/1082981/heatmap/overall",
    "file": "assets/heatmaps/1082981.png"
  },
  {
    "player": "Jofre Torrents",
    "id": 1587196,
    "url": "https://api.sofascore.app/api/v1/player/1587196/heatmap/overall",
    "file": "assets/heatmaps/1587196.png"
  },
  {
    "player": "Ferrán Torres",
    "id": 855833,
    "url": "https://api.sofascore.app/api/v1/player/855833/heatmap/overall",
    "file": "assets/heatmaps/855833.png"
  },
  {
    "player": "Pau Torres",
    "id": 864169,
    "url": "https://api.sofascore.app/api/v1/player/864169/heatmap/overall",
    "file": "assets/heatmaps/864169.png"
  },
  {
    "player": "Lucas Torró",
    "id": 187313,
    "url": "https://api.sofascore.app/api/v1/player/187313/heatmap/overall",
    "file": "assets/heatmaps/187313.png"
  },
  {
    "player": "Jordan Torunarigha",
    "id": 801003,
    "url": "https://api.sofascore.app/api/v1/player/801003/heatmap/overall",
    "file": "assets/heatmaps/801003.png"
  },
  {
    "player": "Alex Tóth",
    "id": 1476524,
    "url": "https://api.sofascore.app/api/v1/player/1476524/heatmap/overall",
    "file": "assets/heatmaps/1476524.png"
  },
  {
    "player": "Abdoulaye Touré",
    "id": 149732,
    "url": "https://api.sofascore.app/api/v1/player/149732/heatmap/overall",
    "file": "assets/heatmaps/149732.png"
  },
  {
    "player": "Alpha Touré",
    "id": 1597191,
    "url": "https://api.sofascore.app/api/v1/player/1597191/heatmap/overall",
    "file": "assets/heatmaps/1597191.png"
  },
  {
    "player": "Bazoumana Touré",
    "id": 1568123,
    "url": "https://api.sofascore.app/api/v1/player/1568123/heatmap/overall",
    "file": "assets/heatmaps/1568123.png"
  },
  {
    "player": "Idrissa Touré",
    "id": 826326,
    "url": "https://api.sofascore.app/api/v1/player/826326/heatmap/overall",
    "file": "assets/heatmaps/826326.png"
  },
  {
    "player": "Ousmane Toure",
    "id": 1513466,
    "url": "https://api.sofascore.app/api/v1/player/1513466/heatmap/overall",
    "file": "assets/heatmaps/1513466.png"
  },
  {
    "player": "Lucas Tousart",
    "id": 787889,
    "url": "https://api.sofascore.app/api/v1/player/787889/heatmap/overall",
    "file": "assets/heatmaps/787889.png"
  },
  {
    "player": "James Trafford",
    "id": 980643,
    "url": "https://api.sofascore.app/api/v1/player/980643/heatmap/overall",
    "file": "assets/heatmaps/980643.png"
  },
  {
    "player": "Mattéo Tramoni",
    "id": 887275,
    "url": "https://api.sofascore.app/api/v1/player/887275/heatmap/overall",
    "file": "assets/heatmaps/887275.png"
  },
  {
    "player": "Bertrand Traoré",
    "id": 218160,
    "url": "https://api.sofascore.app/api/v1/player/218160/heatmap/overall",
    "file": "assets/heatmaps/218160.png"
  },
  {
    "player": "Boubacar Traoré",
    "id": 982613,
    "url": "https://api.sofascore.app/api/v1/player/982613/heatmap/overall",
    "file": "assets/heatmaps/982613.png"
  },
  {
    "player": "Omar Traoré",
    "id": 920022,
    "url": "https://api.sofascore.app/api/v1/player/920022/heatmap/overall",
    "file": "assets/heatmaps/920022.png"
  },
  {
    "player": "Óscar Trejo",
    "id": 21949,
    "url": "https://api.sofascore.app/api/v1/player/21949/heatmap/overall",
    "file": "assets/heatmaps/21949.png"
  },
  {
    "player": "Yael Trepy",
    "id": 1615784,
    "url": "https://api.sofascore.app/api/v1/player/1615784/heatmap/overall",
    "file": "assets/heatmaps/1615784.png"
  },
  {
    "player": "Mike Trésor",
    "id": 826183,
    "url": "https://api.sofascore.app/api/v1/player/826183/heatmap/overall",
    "file": "assets/heatmaps/826183.png"
  },
  {
    "player": "Philipp Treu",
    "id": 979820,
    "url": "https://api.sofascore.app/api/v1/player/979820/heatmap/overall",
    "file": "assets/heatmaps/979820.png"
  },
  {
    "player": "Christopher Trimmel",
    "id": 48557,
    "url": "https://api.sofascore.app/api/v1/player/48557/heatmap/overall",
    "file": "assets/heatmaps/48557.png"
  },
  {
    "player": "Kieran Trippier",
    "id": 69256,
    "url": "https://api.sofascore.app/api/v1/player/69256/heatmap/overall",
    "file": "assets/heatmaps/69256.png"
  },
  {
    "player": "Mariano Troilo",
    "id": 1516324,
    "url": "https://api.sofascore.app/api/v1/player/1516324/heatmap/overall",
    "file": "assets/heatmaps/1516324.png"
  },
  {
    "player": "Leandro Trossard",
    "id": 135666,
    "url": "https://api.sofascore.app/api/v1/player/135666/heatmap/overall",
    "file": "assets/heatmaps/135666.png"
  },
  {
    "player": "Adrien Truffert",
    "id": 999028,
    "url": "https://api.sofascore.app/api/v1/player/999028/heatmap/overall",
    "file": "assets/heatmaps/999028.png"
  },
  {
    "player": "Viktor Tsyhankov",
    "id": 319735,
    "url": "https://api.sofascore.app/api/v1/player/319735/heatmap/overall",
    "file": "assets/heatmaps/319735.png"
  },
  {
    "player": "Axel Tuanzebe",
    "id": 817979,
    "url": "https://api.sofascore.app/api/v1/player/817979/heatmap/overall",
    "file": "assets/heatmaps/817979.png"
  },
  {
    "player": "Kareem Tunde",
    "id": 1649919,
    "url": "https://api.sofascore.app/api/v1/player/1649919/heatmap/overall",
    "file": "assets/heatmaps/1649919.png"
  },
  {
    "player": "Stefano Turati",
    "id": 893752,
    "url": "https://api.sofascore.app/api/v1/player/893752/heatmap/overall",
    "file": "assets/heatmaps/893752.png"
  },
  {
    "player": "Beñat Turrientes",
    "id": 980410,
    "url": "https://api.sofascore.app/api/v1/player/980410/heatmap/overall",
    "file": "assets/heatmaps/980410.png"
  },
  {
    "player": "Stefanos Tzimas",
    "id": 1155321,
    "url": "https://api.sofascore.app/api/v1/player/1155321/heatmap/overall",
    "file": "assets/heatmaps/1155321.png"
  },
  {
    "player": "Destiny Udogie",
    "id": 983572,
    "url": "https://api.sofascore.app/api/v1/player/983572/heatmap/overall",
    "file": "assets/heatmaps/983572.png"
  },
  {
    "player": "Matthieu Udol",
    "id": 787827,
    "url": "https://api.sofascore.app/api/v1/player/787827/heatmap/overall",
    "file": "assets/heatmaps/787827.png"
  },
  {
    "player": "Manuel Ugarte",
    "id": 846425,
    "url": "https://api.sofascore.app/api/v1/player/846425/heatmap/overall",
    "file": "assets/heatmaps/846425.png"
  },
  {
    "player": "Lesley Ugochukwu",
    "id": 1048916,
    "url": "https://api.sofascore.app/api/v1/player/1048916/heatmap/overall",
    "file": "assets/heatmaps/1048916.png"
  },
  {
    "player": "Filip Ugrinic",
    "id": 857482,
    "url": "https://api.sofascore.app/api/v1/player/857482/heatmap/overall",
    "file": "assets/heatmaps/857482.png"
  },
  {
    "player": "Lukas Ullrich",
    "id": 1083382,
    "url": "https://api.sofascore.app/api/v1/player/1083382/heatmap/overall",
    "file": "assets/heatmaps/1083382.png"
  },
  {
    "player": "Sven Ulreich",
    "id": 26768,
    "url": "https://api.sofascore.app/api/v1/player/26768/heatmap/overall",
    "file": "assets/heatmaps/26768.png"
  },
  {
    "player": "Enes Ünal",
    "id": 336655,
    "url": "https://api.sofascore.app/api/v1/player/336655/heatmap/overall",
    "file": "assets/heatmaps/336655.png"
  },
  {
    "player": "Deniz Undav",
    "id": 794298,
    "url": "https://api.sofascore.app/api/v1/player/794298/heatmap/overall",
    "file": "assets/heatmaps/794298.png"
  },
  {
    "player": "Dayot Upamecano",
    "id": 798583,
    "url": "https://api.sofascore.app/api/v1/player/798583/heatmap/overall",
    "file": "assets/heatmaps/798583.png"
  },
  {
    "player": "Jan Urbich",
    "id": 1521250,
    "url": "https://api.sofascore.app/api/v1/player/1521250/heatmap/overall",
    "file": "assets/heatmaps/1521250.png"
  },
  {
    "player": "Jonas Urbig",
    "id": 1130647,
    "url": "https://api.sofascore.app/api/v1/player/1130647/heatmap/overall",
    "file": "assets/heatmaps/1130647.png"
  },
  {
    "player": "Can Uzun",
    "id": 1440948,
    "url": "https://api.sofascore.app/api/v1/player/1440948/heatmap/overall",
    "file": "assets/heatmaps/1440948.png"
  },
  {
    "player": "Josha Vagnoman",
    "id": 906278,
    "url": "https://api.sofascore.app/api/v1/player/906278/heatmap/overall",
    "file": "assets/heatmaps/906278.png"
  },
  {
    "player": "Victor Valdepeñas",
    "id": 1901143,
    "url": "https://api.sofascore.app/api/v1/player/1901143/heatmap/overall",
    "file": "assets/heatmaps/1901143.png"
  },
  {
    "player": "Hákon Valdimarsson",
    "id": 1005959,
    "url": "https://api.sofascore.app/api/v1/player/1005959/heatmap/overall",
    "file": "assets/heatmaps/1005959.png"
  },
  {
    "player": "Lautaro Valenti",
    "id": 958517,
    "url": "https://api.sofascore.app/api/v1/player/958517/heatmap/overall",
    "file": "assets/heatmaps/958517.png"
  },
  {
    "player": "Óscar Valentín",
    "id": 900008,
    "url": "https://api.sofascore.app/api/v1/player/900008/heatmap/overall",
    "file": "assets/heatmaps/900008.png"
  },
  {
    "player": "Nicolás Valentini",
    "id": 1116570,
    "url": "https://api.sofascore.app/api/v1/player/1116570/heatmap/overall",
    "file": "assets/heatmaps/1116570.png"
  },
  {
    "player": "Germán Valera",
    "id": 962710,
    "url": "https://api.sofascore.app/api/v1/player/962710/heatmap/overall",
    "file": "assets/heatmaps/962710.png"
  },
  {
    "player": "Emanuele Valeri",
    "id": 891346,
    "url": "https://api.sofascore.app/api/v1/player/891346/heatmap/overall",
    "file": "assets/heatmaps/891346.png"
  },
  {
    "player": "Martin Valjent",
    "id": 300522,
    "url": "https://api.sofascore.app/api/v1/player/300522/heatmap/overall",
    "file": "assets/heatmaps/300522.png"
  },
  {
    "player": "Álex Valle",
    "id": 1142238,
    "url": "https://api.sofascore.app/api/v1/player/1142238/heatmap/overall",
    "file": "assets/heatmaps/1142238.png"
  },
  {
    "player": "Álvaro Vallés",
    "id": 964983,
    "url": "https://api.sofascore.app/api/v1/player/964983/heatmap/overall",
    "file": "assets/heatmaps/964983.png"
  },
  {
    "player": "Federico Valverde",
    "id": 831808,
    "url": "https://api.sofascore.app/api/v1/player/831808/heatmap/overall",
    "file": "assets/heatmaps/831808.png"
  },
  {
    "player": "Ignace Van Der Brempt",
    "id": 989186,
    "url": "https://api.sofascore.app/api/v1/player/989186/heatmap/overall",
    "file": "assets/heatmaps/989186.png"
  },
  {
    "player": "Virgil van Dijk",
    "id": 151545,
    "url": "https://api.sofascore.app/api/v1/player/151545/heatmap/overall",
    "file": "assets/heatmaps/151545.png"
  },
  {
    "player": "Vladyslav Vanat",
    "id": 976374,
    "url": "https://api.sofascore.app/api/v1/player/976374/heatmap/overall",
    "file": "assets/heatmaps/976374.png"
  },
  {
    "player": "Jari Vandeputte",
    "id": 318645,
    "url": "https://api.sofascore.app/api/v1/player/318645/heatmap/overall",
    "file": "assets/heatmaps/318645.png"
  },
  {
    "player": "Vanderson",
    "id": 1090694,
    "url": "https://api.sofascore.app/api/v1/player/1090694/heatmap/overall",
    "file": "assets/heatmaps/1090694.png"
  },
  {
    "player": "Maarten Vandevoordt",
    "id": 934385,
    "url": "https://api.sofascore.app/api/v1/player/934385/heatmap/overall",
    "file": "assets/heatmaps/934385.png"
  },
  {
    "player": "Charles Vanhoutte",
    "id": 928033,
    "url": "https://api.sofascore.app/api/v1/player/928033/heatmap/overall",
    "file": "assets/heatmaps/928033.png"
  },
  {
    "player": "Jamie Vardy",
    "id": 173827,
    "url": "https://api.sofascore.app/api/v1/player/173827/heatmap/overall",
    "file": "assets/heatmaps/173827.png"
  },
  {
    "player": "Obed Vargas",
    "id": 1119345,
    "url": "https://api.sofascore.app/api/v1/player/1119345/heatmap/overall",
    "file": "assets/heatmaps/1119345.png"
  },
  {
    "player": "Ruben Vargas",
    "id": 872919,
    "url": "https://api.sofascore.app/api/v1/player/872919/heatmap/overall",
    "file": "assets/heatmaps/872919.png"
  },
  {
    "player": "Nikola Vasilj",
    "id": 325061,
    "url": "https://api.sofascore.app/api/v1/player/325061/heatmap/overall",
    "file": "assets/heatmaps/325061.png"
  },
  {
    "player": "Johan Vásquez",
    "id": 889785,
    "url": "https://api.sofascore.app/api/v1/player/889785/heatmap/overall",
    "file": "assets/heatmaps/889785.png"
  },
  {
    "player": "Denis Vavro",
    "id": 293127,
    "url": "https://api.sofascore.app/api/v1/player/293127/heatmap/overall",
    "file": "assets/heatmaps/293127.png"
  },
  {
    "player": "José Luis García Vayá",
    "id": 227922,
    "url": "https://api.sofascore.app/api/v1/player/227922/heatmap/overall",
    "file": "assets/heatmaps/227922.png"
  },
  {
    "player": "Robinio Vaz",
    "id": 1514800,
    "url": "https://api.sofascore.app/api/v1/player/1514800/heatmap/overall",
    "file": "assets/heatmaps/1514800.png"
  },
  {
    "player": "Jesus Vazquez",
    "id": 996929,
    "url": "https://api.sofascore.app/api/v1/player/996929/heatmap/overall",
    "file": "assets/heatmaps/996929.png"
  },
  {
    "player": "Lucas Vázquez",
    "id": 255239,
    "url": "https://api.sofascore.app/api/v1/player/255239/heatmap/overall",
    "file": "assets/heatmaps/255239.png"
  },
  {
    "player": "Luis Vázquez",
    "id": 974713,
    "url": "https://api.sofascore.app/api/v1/player/974713/heatmap/overall",
    "file": "assets/heatmaps/974713.png"
  },
  {
    "player": "Matías Vecino",
    "id": 158615,
    "url": "https://api.sofascore.app/api/v1/player/158615/heatmap/overall",
    "file": "assets/heatmaps/158615.png"
  },
  {
    "player": "Danilo Veiga",
    "id": 1002045,
    "url": "https://api.sofascore.app/api/v1/player/1002045/heatmap/overall",
    "file": "assets/heatmaps/1002045.png"
  },
  {
    "player": "Renato Veiga",
    "id": 1087359,
    "url": "https://api.sofascore.app/api/v1/player/1087359/heatmap/overall",
    "file": "assets/heatmaps/1087359.png"
  },
  {
    "player": "Joël Veltman",
    "id": 219572,
    "url": "https://api.sofascore.app/api/v1/player/219572/heatmap/overall",
    "file": "assets/heatmaps/219572.png"
  },
  {
    "player": "Micky van de Ven",
    "id": 998247,
    "url": "https://api.sofascore.app/api/v1/player/998247/heatmap/overall",
    "file": "assets/heatmaps/998247.png"
  },
  {
    "player": "Unai Vencedor Paris",
    "id": 966802,
    "url": "https://api.sofascore.app/api/v1/player/966802/heatmap/overall",
    "file": "assets/heatmaps/966802.png"
  },
  {
    "player": "Lorenzo Venturino",
    "id": 1618563,
    "url": "https://api.sofascore.app/api/v1/player/1618563/heatmap/overall",
    "file": "assets/heatmaps/1618563.png"
  },
  {
    "player": "Nikolas Veratschnig",
    "id": 1138150,
    "url": "https://api.sofascore.app/api/v1/player/1138150/heatmap/overall",
    "file": "assets/heatmaps/1138150.png"
  },
  {
    "player": "Bart Verbruggen",
    "id": 994363,
    "url": "https://api.sofascore.app/api/v1/player/994363/heatmap/overall",
    "file": "assets/heatmaps/994363.png"
  },
  {
    "player": "Calvin Verdonk",
    "id": 361780,
    "url": "https://api.sofascore.app/api/v1/player/361780/heatmap/overall",
    "file": "assets/heatmaps/361780.png"
  },
  {
    "player": "Antonio Vergara",
    "id": 1069560,
    "url": "https://api.sofascore.app/api/v1/player/1069560/heatmap/overall",
    "file": "assets/heatmaps/1069560.png"
  },
  {
    "player": "Arthur Vermeeren",
    "id": 1149127,
    "url": "https://api.sofascore.app/api/v1/player/1149127/heatmap/overall",
    "file": "assets/heatmaps/1149127.png"
  },
  {
    "player": "Ioan Vermeșan",
    "id": 1152477,
    "url": "https://api.sofascore.app/api/v1/player/1152477/heatmap/overall",
    "file": "assets/heatmaps/1152477.png"
  },
  {
    "player": "Jozhua Vertrouwd",
    "id": 1120947,
    "url": "https://api.sofascore.app/api/v1/player/1120947/heatmap/overall",
    "file": "assets/heatmaps/1120947.png"
  },
  {
    "player": "Mikel Vesga",
    "id": 359742,
    "url": "https://api.sofascore.app/api/v1/player/359742/heatmap/overall",
    "file": "assets/heatmaps/359742.png"
  },
  {
    "player": "Guglielmo Vicario",
    "id": 553606,
    "url": "https://api.sofascore.app/api/v1/player/553606/heatmap/overall",
    "file": "assets/heatmaps/553606.png"
  },
  {
    "player": "Nacho Vidal",
    "id": 844752,
    "url": "https://api.sofascore.app/api/v1/player/844752/heatmap/overall",
    "file": "assets/heatmaps/844752.png"
  },
  {
    "player": "Fabio Vieira",
    "id": 904835,
    "url": "https://api.sofascore.app/api/v1/player/904835/heatmap/overall",
    "file": "assets/heatmaps/904835.png"
  },
  {
    "player": "Julián Vignolo",
    "id": 1657108,
    "url": "https://api.sofascore.app/api/v1/player/1657108/heatmap/overall",
    "file": "assets/heatmaps/1657108.png"
  },
  {
    "player": "Gonzalo Villar",
    "id": 914765,
    "url": "https://api.sofascore.app/api/v1/player/914765/heatmap/overall",
    "file": "assets/heatmaps/914765.png"
  },
  {
    "player": "Federico Viñas",
    "id": 976104,
    "url": "https://api.sofascore.app/api/v1/player/976104/heatmap/overall",
    "file": "assets/heatmaps/976104.png"
  },
  {
    "player": "Jan Virgili",
    "id": 1939173,
    "url": "https://api.sofascore.app/api/v1/player/1939173/heatmap/overall",
    "file": "assets/heatmaps/1939173.png"
  },
  {
    "player": "Martin Vitík",
    "id": 1085913,
    "url": "https://api.sofascore.app/api/v1/player/1085913/heatmap/overall",
    "file": "assets/heatmaps/1085913.png"
  },
  {
    "player": "Vitinha",
    "id": 1093695,
    "url": "https://api.sofascore.app/api/v1/player/1093695/heatmap/overall",
    "file": "assets/heatmaps/1093695.png"
  },
  {
    "player": "Rayan Vitor",
    "id": 1464966,
    "url": "https://api.sofascore.app/api/v1/player/1464966/heatmap/overall",
    "file": "assets/heatmaps/1464966.png"
  },
  {
    "player": "Daniel Vivian",
    "id": 910978,
    "url": "https://api.sofascore.app/api/v1/player/910978/heatmap/overall",
    "file": "assets/heatmaps/910978.png"
  },
  {
    "player": "Odysseas Vlachodimos",
    "id": 138149,
    "url": "https://api.sofascore.app/api/v1/player/138149/heatmap/overall",
    "file": "assets/heatmaps/138149.png"
  },
  {
    "player": "Dušan Vlahović",
    "id": 832208,
    "url": "https://api.sofascore.app/api/v1/player/832208/heatmap/overall",
    "file": "assets/heatmaps/832208.png"
  },
  {
    "player": "Nikola Vlašić",
    "id": 357596,
    "url": "https://api.sofascore.app/api/v1/player/357596/heatmap/overall",
    "file": "assets/heatmaps/357596.png"
  },
  {
    "player": "Mërgim Vojvoda",
    "id": 798147,
    "url": "https://api.sofascore.app/api/v1/player/798147/heatmap/overall",
    "file": "assets/heatmaps/798147.png"
  },
  {
    "player": "Cristian Volpato",
    "id": 1155625,
    "url": "https://api.sofascore.app/api/v1/player/1155625/heatmap/overall",
    "file": "assets/heatmaps/1155625.png"
  },
  {
    "player": "Alexis Vossah",
    "id": 2193194,
    "url": "https://api.sofascore.app/api/v1/player/2193194/heatmap/overall",
    "file": "assets/heatmaps/2193194.png"
  },
  {
    "player": "Aster Vranckx",
    "id": 989371,
    "url": "https://api.sofascore.app/api/v1/player/989371/heatmap/overall",
    "file": "assets/heatmaps/989371.png"
  },
  {
    "player": "Stefan de Vrij",
    "id": 91046,
    "url": "https://api.sofascore.app/api/v1/player/91046/heatmap/overall",
    "file": "assets/heatmaps/91046.png"
  },
  {
    "player": "İsak Vural",
    "id": 1210995,
    "url": "https://api.sofascore.app/api/v1/player/1210995/heatmap/overall",
    "file": "assets/heatmaps/1210995.png"
  },
  {
    "player": "Luka Vušković",
    "id": 1405212,
    "url": "https://api.sofascore.app/api/v1/player/1405212/heatmap/overall",
    "file": "assets/heatmaps/1405212.png"
  },
  {
    "player": "Yannik Wagner",
    "id": 2189165,
    "url": "https://api.sofascore.app/api/v1/player/2189165/heatmap/overall",
    "file": "assets/heatmaps/2189165.png"
  },
  {
    "player": "Hauke Wahl",
    "id": 253469,
    "url": "https://api.sofascore.app/api/v1/player/253469/heatmap/overall",
    "file": "assets/heatmaps/253469.png"
  },
  {
    "player": "Luca Waldschmidt",
    "id": 319861,
    "url": "https://api.sofascore.app/api/v1/player/319861/heatmap/overall",
    "file": "assets/heatmaps/319861.png"
  },
  {
    "player": "Kyle Walker",
    "id": 44614,
    "url": "https://api.sofascore.app/api/v1/player/44614/heatmap/overall",
    "file": "assets/heatmaps/44614.png"
  },
  {
    "player": "Kyle Walker-Peters",
    "id": 823085,
    "url": "https://api.sofascore.app/api/v1/player/823085/heatmap/overall",
    "file": "assets/heatmaps/823085.png"
  },
  {
    "player": "Sebastian Walukiewicz",
    "id": 886243,
    "url": "https://api.sofascore.app/api/v1/player/886243/heatmap/overall",
    "file": "assets/heatmaps/886243.png"
  },
  {
    "player": "Aaron Wan-Bissaka",
    "id": 863653,
    "url": "https://api.sofascore.app/api/v1/player/863653/heatmap/overall",
    "file": "assets/heatmaps/863653.png"
  },
  {
    "player": "James Ward-Prowse",
    "id": 161717,
    "url": "https://api.sofascore.app/api/v1/player/161717/heatmap/overall",
    "file": "assets/heatmaps/161717.png"
  },
  {
    "player": "Ollie Watkins",
    "id": 555386,
    "url": "https://api.sofascore.app/api/v1/player/555386/heatmap/overall",
    "file": "assets/heatmaps/555386.png"
  },
  {
    "player": "Timothy Weah",
    "id": 855810,
    "url": "https://api.sofascore.app/api/v1/player/855810/heatmap/overall",
    "file": "assets/heatmaps/855810.png"
  },
  {
    "player": "Nelson Weiper",
    "id": 1152505,
    "url": "https://api.sofascore.app/api/v1/player/1152505/heatmap/overall",
    "file": "assets/heatmaps/1152505.png"
  },
  {
    "player": "Danny Welbeck",
    "id": 33902,
    "url": "https://api.sofascore.app/api/v1/player/33902/heatmap/overall",
    "file": "assets/heatmaps/33902.png"
  },
  {
    "player": "Wesley",
    "id": 1211632,
    "url": "https://api.sofascore.app/api/v1/player/1211632/heatmap/overall",
    "file": "assets/heatmaps/1211632.png"
  },
  {
    "player": "Adam Wharton",
    "id": 1109771,
    "url": "https://api.sofascore.app/api/v1/player/1109771/heatmap/overall",
    "file": "assets/heatmaps/1109771.png"
  },
  {
    "player": "Ben White",
    "id": 846036,
    "url": "https://api.sofascore.app/api/v1/player/846036/heatmap/overall",
    "file": "assets/heatmaps/846036.png"
  },
  {
    "player": "Silvan Widmer",
    "id": 157377,
    "url": "https://api.sofascore.app/api/v1/player/157377/heatmap/overall",
    "file": "assets/heatmaps/157377.png"
  },
  {
    "player": "Mats Wieffer",
    "id": 959628,
    "url": "https://api.sofascore.app/api/v1/player/959628/heatmap/overall",
    "file": "assets/heatmaps/959628.png"
  },
  {
    "player": "Iñaki Williams",
    "id": 783374,
    "url": "https://api.sofascore.app/api/v1/player/783374/heatmap/overall",
    "file": "assets/heatmaps/783374.png"
  },
  {
    "player": "Neco Williams",
    "id": 927356,
    "url": "https://api.sofascore.app/api/v1/player/927356/heatmap/overall",
    "file": "assets/heatmaps/927356.png"
  },
  {
    "player": "Nico Williams",
    "id": 1085400,
    "url": "https://api.sofascore.app/api/v1/player/1085400/heatmap/overall",
    "file": "assets/heatmaps/1085400.png"
  },
  {
    "player": "Estêvão Willian",
    "id": 1597265,
    "url": "https://api.sofascore.app/api/v1/player/1597265/heatmap/overall",
    "file": "assets/heatmaps/1597265.png"
  },
  {
    "player": "Joe Willock",
    "id": 888550,
    "url": "https://api.sofascore.app/api/v1/player/888550/heatmap/overall",
    "file": "assets/heatmaps/888550.png"
  },
  {
    "player": "Callum Wilson",
    "id": 113956,
    "url": "https://api.sofascore.app/api/v1/player/113956/heatmap/overall",
    "file": "assets/heatmaps/113956.png"
  },
  {
    "player": "Harry Wilson",
    "id": 355528,
    "url": "https://api.sofascore.app/api/v1/player/355528/heatmap/overall",
    "file": "assets/heatmaps/355528.png"
  },
  {
    "player": "Patrick Wimmer",
    "id": 987504,
    "url": "https://api.sofascore.app/api/v1/player/987504/heatmap/overall",
    "file": "assets/heatmaps/987504.png"
  },
  {
    "player": "Jonas Wind",
    "id": 826069,
    "url": "https://api.sofascore.app/api/v1/player/826069/heatmap/overall",
    "file": "assets/heatmaps/826069.png"
  },
  {
    "player": "Florian Wirtz",
    "id": 1019322,
    "url": "https://api.sofascore.app/api/v1/player/1019322/heatmap/overall",
    "file": "assets/heatmaps/1019322.png"
  },
  {
    "player": "Yoane Wissa",
    "id": 805123,
    "url": "https://api.sofascore.app/api/v1/player/805123/heatmap/overall",
    "file": "assets/heatmaps/805123.png"
  },
  {
    "player": "Axel Witsel",
    "id": 35612,
    "url": "https://api.sofascore.app/api/v1/player/35612/heatmap/overall",
    "file": "assets/heatmaps/35612.png"
  },
  {
    "player": "Marius Wolf",
    "id": 254119,
    "url": "https://api.sofascore.app/api/v1/player/254119/heatmap/overall",
    "file": "assets/heatmaps/254119.png"
  },
  {
    "player": "Nick Woltemade",
    "id": 980623,
    "url": "https://api.sofascore.app/api/v1/player/980623/heatmap/overall",
    "file": "assets/heatmaps/980623.png"
  },
  {
    "player": "Jeong Woo-yeong",
    "id": 927405,
    "url": "https://api.sofascore.app/api/v1/player/927405/heatmap/overall",
    "file": "assets/heatmaps/927405.png"
  },
  {
    "player": "Chris Wood",
    "id": 50480,
    "url": "https://api.sofascore.app/api/v1/player/50480/heatmap/overall",
    "file": "assets/heatmaps/50480.png"
  },
  {
    "player": "Joe Worrall",
    "id": 838399,
    "url": "https://api.sofascore.app/api/v1/player/838399/heatmap/overall",
    "file": "assets/heatmaps/838399.png"
  },
  {
    "player": "Daniel Xavier Semedo",
    "id": 2430329,
    "url": "https://api.sofascore.app/api/v1/player/2430329/heatmap/overall",
    "file": "assets/heatmaps/2430329.png"
  },
  {
    "player": "Granit Xhaka",
    "id": 117777,
    "url": "https://api.sofascore.app/api/v1/player/117777/heatmap/overall",
    "file": "assets/heatmaps/117777.png"
  },
  {
    "player": "Lamine Yamal",
    "id": 1402912,
    "url": "https://api.sofascore.app/api/v1/player/1402912/heatmap/overall",
    "file": "assets/heatmaps/1402912.png"
  },
  {
    "player": "Daniel Yáñez",
    "id": 1546404,
    "url": "https://api.sofascore.app/api/v1/player/1546404/heatmap/overall",
    "file": "assets/heatmaps/1546404.png"
  },
  {
    "player": "Roman Yaremchuk",
    "id": 829296,
    "url": "https://api.sofascore.app/api/v1/player/829296/heatmap/overall",
    "file": "assets/heatmaps/829296.png"
  },
  {
    "player": "Yehor Yarmoliuk",
    "id": 1031258,
    "url": "https://api.sofascore.app/api/v1/player/1031258/heatmap/overall",
    "file": "assets/heatmaps/1031258.png"
  },
  {
    "player": "Gessime Yassine",
    "id": 1638338,
    "url": "https://api.sofascore.app/api/v1/player/1638338/heatmap/overall",
    "file": "assets/heatmaps/1638338.png"
  },
  {
    "player": "Ryan Yates",
    "id": 846252,
    "url": "https://api.sofascore.app/api/v1/player/846252/heatmap/overall",
    "file": "assets/heatmaps/846252.png"
  },
  {
    "player": "Terry Yegbe",
    "id": 1200442,
    "url": "https://api.sofascore.app/api/v1/player/1200442/heatmap/overall",
    "file": "assets/heatmaps/1200442.png"
  },
  {
    "player": "Kenan Yıldız",
    "id": 1149011,
    "url": "https://api.sofascore.app/api/v1/player/1149011/heatmap/overall",
    "file": "assets/heatmaps/1149011.png"
  },
  {
    "player": "Darlin Yongwa",
    "id": 998241,
    "url": "https://api.sofascore.app/api/v1/player/998241/heatmap/overall",
    "file": "assets/heatmaps/998241.png"
  },
  {
    "player": "Leny Yoro",
    "id": 1153315,
    "url": "https://api.sofascore.app/api/v1/player/1153315/heatmap/overall",
    "file": "assets/heatmaps/1153315.png"
  },
  {
    "player": "Etienne Youte Kinkoue",
    "id": 980406,
    "url": "https://api.sofascore.app/api/v1/player/980406/heatmap/overall",
    "file": "assets/heatmaps/980406.png"
  },
  {
    "player": "Illia Zabarnyi",
    "id": 1023567,
    "url": "https://api.sofascore.app/api/v1/player/1023567/heatmap/overall",
    "file": "assets/heatmaps/1023567.png"
  },
  {
    "player": "Yassir Zabiri",
    "id": 1606013,
    "url": "https://api.sofascore.app/api/v1/player/1606013/heatmap/overall",
    "file": "assets/heatmaps/1606013.png"
  },
  {
    "player": "Mattia Zaccagni",
    "id": 293581,
    "url": "https://api.sofascore.app/api/v1/player/293581/heatmap/overall",
    "file": "assets/heatmaps/293581.png"
  },
  {
    "player": "Dan-Axel Zagadou",
    "id": 826205,
    "url": "https://api.sofascore.app/api/v1/player/826205/heatmap/overall",
    "file": "assets/heatmaps/826205.png"
  },
  {
    "player": "Stephan Zagadou",
    "id": 2073555,
    "url": "https://api.sofascore.app/api/v1/player/2073555/heatmap/overall",
    "file": "assets/heatmaps/2073555.png"
  },
  {
    "player": "Warren Zaïre-Emery",
    "id": 1142672,
    "url": "https://api.sofascore.app/api/v1/player/1142672/heatmap/overall",
    "file": "assets/heatmaps/1142672.png"
  },
  {
    "player": "Denis Zakaria",
    "id": 770677,
    "url": "https://api.sofascore.app/api/v1/player/770677/heatmap/overall",
    "file": "assets/heatmaps/770677.png"
  },
  {
    "player": "Arsen Zakharyan",
    "id": 1066045,
    "url": "https://api.sofascore.app/api/v1/player/1066045/heatmap/overall",
    "file": "assets/heatmaps/1066045.png"
  },
  {
    "player": "Nicola Zalewski",
    "id": 984184,
    "url": "https://api.sofascore.app/api/v1/player/984184/heatmap/overall",
    "file": "assets/heatmaps/984184.png"
  },
  {
    "player": "Nicolò Zaniolo",
    "id": 864898,
    "url": "https://api.sofascore.app/api/v1/player/864898/heatmap/overall",
    "file": "assets/heatmaps/864898.png"
  },
  {
    "player": "Alessandro Zanoli",
    "id": 922928,
    "url": "https://api.sofascore.app/api/v1/player/922928/heatmap/overall",
    "file": "assets/heatmaps/922928.png"
  },
  {
    "player": "Duván Zapata",
    "id": 38162,
    "url": "https://api.sofascore.app/api/v1/player/38162/heatmap/overall",
    "file": "assets/heatmaps/38162.png"
  },
  {
    "player": "Gabriele Zappa",
    "id": 927304,
    "url": "https://api.sofascore.app/api/v1/player/927304/heatmap/overall",
    "file": "assets/heatmaps/927304.png"
  },
  {
    "player": "Davide Zappacosta",
    "id": 132318,
    "url": "https://api.sofascore.app/api/v1/player/132318/heatmap/overall",
    "file": "assets/heatmaps/132318.png"
  },
  {
    "player": "Oier Zarraga",
    "id": 1009661,
    "url": "https://api.sofascore.app/api/v1/player/1009661/heatmap/overall",
    "file": "assets/heatmaps/1009661.png"
  },
  {
    "player": "Nils Zätterström",
    "id": 1435226,
    "url": "https://api.sofascore.app/api/v1/player/1435226/heatmap/overall",
    "file": "assets/heatmaps/1435226.png"
  },
  {
    "player": "Aaron Zehnter",
    "id": 1127788,
    "url": "https://api.sofascore.app/api/v1/player/1127788/heatmap/overall",
    "file": "assets/heatmaps/1127788.png"
  },
  {
    "player": "Jordan Zemura",
    "id": 964119,
    "url": "https://api.sofascore.app/api/v1/player/964119/heatmap/overall",
    "file": "assets/heatmaps/964119.png"
  },
  {
    "player": "Robin Zentner",
    "id": 174345,
    "url": "https://api.sofascore.app/api/v1/player/174345/heatmap/overall",
    "file": "assets/heatmaps/174345.png"
  },
  {
    "player": "Alessio Zerbin",
    "id": 869888,
    "url": "https://api.sofascore.app/api/v1/player/869888/heatmap/overall",
    "file": "assets/heatmaps/869888.png"
  },
  {
    "player": "Cedric Zesiger",
    "id": 798926,
    "url": "https://api.sofascore.app/api/v1/player/798926/heatmap/overall",
    "file": "assets/heatmaps/798926.png"
  },
  {
    "player": "Michael Zetterer",
    "id": 190161,
    "url": "https://api.sofascore.app/api/v1/player/190161/heatmap/overall",
    "file": "assets/heatmaps/190161.png"
  },
  {
    "player": "Edon Zhegrova",
    "id": 887766,
    "url": "https://api.sofascore.app/api/v1/player/887766/heatmap/overall",
    "file": "assets/heatmaps/887766.png"
  },
  {
    "player": "Piotr Zieliński",
    "id": 138605,
    "url": "https://api.sofascore.app/api/v1/player/138605/heatmap/overall",
    "file": "assets/heatmaps/138605.png"
  },
  {
    "player": "Melvin Zinga",
    "id": 963201,
    "url": "https://api.sofascore.app/api/v1/player/963201/heatmap/overall",
    "file": "assets/heatmaps/963201.png"
  },
  {
    "player": "Jan Ziółkowski",
    "id": 1499991,
    "url": "https://api.sofascore.app/api/v1/player/1499991/heatmap/overall",
    "file": "assets/heatmaps/1499991.png"
  },
  {
    "player": "Joshua Zirkzee",
    "id": 917007,
    "url": "https://api.sofascore.app/api/v1/player/917007/heatmap/overall",
    "file": "assets/heatmaps/917007.png"
  },
  {
    "player": "Budu Zivzivadze",
    "id": 149728,
    "url": "https://api.sofascore.app/api/v1/player/149728/heatmap/overall",
    "file": "assets/heatmaps/149728.png"
  },
  {
    "player": "Luck Zogbé",
    "id": 1499870,
    "url": "https://api.sofascore.app/api/v1/player/1499870/heatmap/overall",
    "file": "assets/heatmaps/1499870.png"
  },
  {
    "player": "Nadir Zortea",
    "id": 928104,
    "url": "https://api.sofascore.app/api/v1/player/928104/heatmap/overall",
    "file": "assets/heatmaps/928104.png"
  },
  {
    "player": "Yanis Zouaoui",
    "id": 1397882,
    "url": "https://api.sofascore.app/api/v1/player/1397882/heatmap/overall",
    "file": "assets/heatmaps/1397882.png"
  },
  {
    "player": "Igor Zubeldia",
    "id": 838159,
    "url": "https://api.sofascore.app/api/v1/player/838159/heatmap/overall",
    "file": "assets/heatmaps/838159.png"
  },
  {
    "player": "Martín Zubimendi",
    "id": 966837,
    "url": "https://api.sofascore.app/api/v1/player/966837/heatmap/overall",
    "file": "assets/heatmaps/966837.png"
  },
  {
    "player": "Martin Ødegaard",
    "id": 547410,
    "url": "https://api.sofascore.app/api/v1/player/547410/heatmap/overall",
    "file": "assets/heatmaps/547410.png"
  }
]

def download():
    ok, fail = 0, 0
    for p in tqdm(PLAYERS, desc="Downloading heatmaps"):
        filepath = ROOT / p["file"]
        if filepath.exists():
            ok += 1
            continue
        try:
            r = requests.get(p["url"], headers=HEADERS, timeout=30)
            if r.status_code == 200:
                filepath.parent.mkdir(parents=True, exist_ok=True)
                filepath.write_bytes(r.content)
                ok += 1
            else:
                print(f"  HTTP {r.status_code} for {p['player']}")
                fail += 1
        except Exception as e:
            print(f"  Error {p['player']}: {e}")
            fail += 1
        time.sleep(random.uniform(2, 5))
    print(f"\nDone: {ok} downloaded, {fail} failed")

if __name__ == "__main__":
    download()
