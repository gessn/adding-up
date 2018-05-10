'use strict';
const fs = require('fs');
/*Node.jsのモジュール呼び出し
fs は、FileSystem の略で、ファイルを扱うためのモジュールです。*/
const readline = require('readline');
/*Node.jsのモジュール呼び出し
readline は、ファイルを一行ずつ読み込むためのモジュールです。*/
const rs = fs.ReadStream('./popu-pref.csv')
const rl = readline.createInterface({ 'input' : rs, 'output' : {} });
/*以上の部分は popu-pref.csv ファイルから、ファイルを読み込みを行う Stream を生成し、さらにそれを readline オブジェクトの input として設定し、 rl オブジェクトを作成しています。*/
const map = new Map(); // key: 都道府県 value: 集計データのオブジェクト
//集計されたデータを格納する連想配列です。

rl.on('line', (lineString) => {
    const columns = lineString.split(',');
    /*この行は、引数 lineString で与えられた文字列をカンマ , で分割して、それを columns という配列にしています。
    たとえば、"ab,cde,f" という文字列であれば、["ab", "cde", "f"]という文字列からなる配列に分割されます。*/
    const year = parseInt(columns[0]);
    const prefecture = columns[2];
    const popu = parseInt(columns[7]);
    //上記では配列 columns の要素へ並び順の番号でアクセスして、集計年、都道府県、15〜19 歳の人口、をそれぞれ変数に保存しています。
    if (year === 2010 || year === 2015){
        let value = map.get(prefecture);
        if (!value){
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        /*このコードは連想配列 map からデータを取得しています。
        value の値が Falsy の場合に、value に初期値となるオブジェクトを代入します。
        その県のデータを処理するのが初めてであれば、value の値は undefined になるので、この条件を満たし、value に値が代入されます。*/
        if (year === 2010){
            value.popu10 += popu;
        }
        if (year === 2015){
            value.popu15 += popu;
        }
        map.set(prefecture, value);
    }
});
rl.resume();
//このコードは、rl オブジェクトで line というイベントが発生したらこの無名関数を呼んでください、という意味です。
rl.on('close', () => {
    for (let pair of map){
        const value = pair[1];
        value.change = value.popu15 / value.popu10;
    }
    const rankingArray = Array.from(map).sort((pair1, pair2) => { return pair2[1].change - pair1[1].change;
});
    const rankingStrings = rankingArray.map((pair) => {
        return pair[0] + ': ' + pair[1].popu10 + '=>' + pair[1].popu15 + ' 変化率:' + pair[1].change;
    });
    console.log(rankingStrings);
});