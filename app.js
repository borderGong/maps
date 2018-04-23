// 定义map
let map, markers, infowindow;
const points = [
    {
        title: '故宫博物院',
        lat: 39.9176718710,
        lng: 116.3971864841
    },
    {
        title: '景山公园',
        lat: 39.9264914074,
        lng: 116.3965786593
    },
    {
        title: '北海公园',
        lat: 39.9272692029,
        lng: 116.3886708770
    },
    {
        title: '国家大剧院',
        lat: 39.9048340787,
        lng: 116.3897190553
    },
    {
        title: '中山公园',
        lat: 39.9117461163,
        lng: 116.3948672466,
    },
    {
        title: '西单大悦城',
        lat: 39.9105338820,
        lng: 116.3732057966
    }
];
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
            fetchAddressInfo(item.position.lat(), item.position.lng())
                .then(response => response.json())
                .then(response => {
                    console.log(response);
                    let content;
                    if(response.status === 'OK'){
                        content = `${item.title}: ${response.results[0].formatted_address}`;
                    }else{
                        content = '获取详细地址失败！';
                    }
                    infowindow.setContent(content);
                    infowindow.open(map, item);
                })
                .catch(err => console.log(err));
          });
    })
};
function fetchAddressInfo(lat, lng){
    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyACu_OoClylQmszcJRW6q26vrZzCclga4g`);
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
            fetchAddressInfo(item.position.lat(), item.position.lng())
                .then(response => response.json())
                .then(response => {
                    console.log(response);
                    let content;
                    if(response.status === 'OK'){
                        content = `${item.title}: ${response.results[0].formatted_address}`;
                    }else{
                        content = '获取详细地址失败！';
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