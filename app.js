const load = $(`<span>loading...</span>`);
// 地图加载错误信息
function mapErrorHandler(){
    document.querySelector('#map').innerHTML = '地图加载错误，请刷新重试';
}
// 定义map
let map, markers, infowindow;
function initMap(){
    // 初始化地图
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 39.905, lng: 116.4},
        //   styles: styles,
        zoom: 12
    });
    // 实力化infowindow
    infowindow = new google.maps.InfoWindow();
    // 实力化markers
    markers = points.map(item => {
        return new google.maps.Marker({
            position: { lat: item.lat, lng: item.lng },
            map: map,
            title: item.title,
        });
    });
    markers.forEach(item => {
        item.addListener('click', function() {
            const pinyin = points.filter(point => point.title === item.title)[0].pinyin;
            // loading
            infowindow.setContent(load.get(0));
            infowindow.open(map, item);
            fetchApiInfo(item.position.lat(), item.position.lng(), pinyin)
                .then(([res1, res2]) => {
                    console.log(res1, res2);
                    let content;
                    if(res1.status === 'OK' && res2.status === 'Success'){
                        content = `${item.title}: ${res1.results[0].formatted_address} ${res2.result.abstract}`;
                    }else{
                        content = '获取信息失败！';
                    }
                    infowindow.setContent(content);
                    infowindow.open(map, item);
                })
                .catch(err => console.log(err));
          });
    })
};
// 获取google地理位置信息
function fetchAddressInfo(lat, lng){
    return new Promise((reslove, reject) => {
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyACu_OoClylQmszcJRW6q26vrZzCclga4g`)
            .then(response => response.json())
            .then(result => reslove(result))
            .catch(err => reject(err));
    })
}
// 获取景点描述信息
function fetchAddressDesction(addressName){
    return new Promise((reslove, reject) => {
        $.getJSON(`http://api.map.baidu.com/telematics/v3/travel_attractions?id=${addressName}&ak=XuKznZr3l5b1aIS4S5MYjvSh&output=json&callback=?`)
        .done(res => reslove(res))
        .fail(err => reject(err))
    });
}
// 封装获取两个api信息
function fetchApiInfo(lat, lng, pinyinName){
    return Promise.all([fetchAddressInfo(lat, lng), fetchAddressDesction(pinyinName)])
}

(function init(){
    const PointerModel = function(items) {
        this.showMenu = ko.observable(true);
        this.items = ko.observableArray(items);
        this.filterItem = function() {
            const filter = document.querySelector('#filter').value;
            if (filter != "") {
                const filterData = points.forEach((item, index) => {
                    if(!(~item.title.indexOf(filter))){
                        this.items.remove(item);
                    }
                });
            }else{
                points.forEach(item => this.items.push(item));
                
            }
        }.bind(this); 
        this.clickItem = function(e){
            const index = points.findIndex(item => item.title === e.title);
            const item = markers[index];
            infowindow.setContent(load.get(0));
            infowindow.open(map, item);
            fetchApiInfo(item.position.lat(), item.position.lng(), points[index].pinyin)
                .then(([res1, res2]) => {
                    let content;
                    if(res1.status === 'OK' && res2.status === 'Success'){
                        content = `${item.title}: ${res1.results[0].formatted_address} ${res2.result.abstract}`;
                    }else{
                        content = '获取信息失败！';
                    }
                    infowindow.setContent(content);
                    infowindow.open(map, item);
                })
                .catch(err => console.log(err));
        }.bind(this);
        this.toggleMenu = function(){
            this.showMenu(!this.showMenu());
        }.bind(this);
    };
     
    ko.applyBindings(new PointerModel(points.slice()));
})();

