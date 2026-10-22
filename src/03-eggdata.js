// ─── Easter egg data (from easterEggData.js, unchanged) ─────────────────────
// 초기 배치 이스터에그 30개 (AUDIO: 10개, SPATIAL: 10개, INFO_POPUP: 10개)
const INITIAL_EASTER_EGGS=[
  {id:"EE_001",type:"AUDIO",position:{x:25,y:1.5,z:-30},triggerRadius:9.0,audioConfig:{src:"assets/audio/cm_song_reversed_2002.mp3",synthFallback:{wave:"sawtooth",baseFreq:220,modFreq:3.5},description:"2002년 아파트 분양 CM송이 0.5배속 역재생되며 에코가 걸림"},visualTarget:"AudioAnomalyOrb",requiredClicks:1,floatingLabel:"[음성 신호 감지: 푸른마을 행복송_역방향.wav]"},
  {id:"EE_002",type:"AUDIO",position:{x:-45,y:1.5,z:15},triggerRadius:8.0,audioConfig:{src:"assets/audio/intercom_ring_endless.mp3",synthFallback:{wave:"square",baseFreq:880,modFreq:12.0},description:"초원 한가운데서 구형 코콤(KOCOM) 비디오폰 호출 벨소리가 왜곡되어 울림"},visualTarget:"GlassPhoneBooth2002",requiredClicks:2,floatingLabel:"[호출 중: 104동 지하에 없는 세대]"},
  {id:"EE_003",type:"AUDIO",position:{x:70,y:1.5,z:60},triggerRadius:10.0,audioConfig:{src:"assets/audio/dialup_modem_scream.mp3",synthFallback:{wave:"triangle",baseFreq:1400,modFreq:25.0},description:"56k 전화선 모뎀 접속음과 누군가의 한숨 소리가 섞여서 들림"},visualTarget:"AudioAnomalyOrb",requiredClicks:1,floatingLabel:"[천리안/하이텔 초고속 광랜 단지 연결 오류]"},
  {id:"EE_004",type:"AUDIO",position:{x:-80,y:1.5,z:-75},triggerRadius:8.5,audioConfig:{src:"assets/audio/elevator_voice_loop.mp3",synthFallback:{wave:"sine",baseFreq:310,modFreq:1.5},description:"'올라갑니다... 백사십이층입니다...' 하는 엘리베이터 안내 음성이 무한 반복"},visualTarget:"FloatingElevatorCore",requiredClicks:3,floatingLabel:"[운행 안내: 존재하지 않는 층으로 이동 중]"},
  {id:"EE_005",type:"AUDIO",position:{x:10,y:1.5,z:95},triggerRadius:7.5,audioConfig:{src:"assets/audio/playground_laughter_bitcrush.mp3",synthFallback:{wave:"square",baseFreq:520,modFreq:6.0},description:"8비트로 심하게 깨진 아이들의 웃음소리와 철제 그네 삐걱거리는 소리"},visualTarget:"PlasticPlaygroundSlide",requiredClicks:2,floatingLabel:"[녹음 일시: 2001.05.05 오후 7시 44분]"},
  {id:"EE_006",type:"AUDIO",position:{x:-110,y:1.5,z:40},triggerRadius:9.0,audioConfig:{src:"assets/audio/apartment_broadcast_chime.mp3",synthFallback:{wave:"sine",baseFreq:440,modFreq:0.8},description:"아파트 관리실 실로폰 차임벨('딩-동-댕-동-')이 음정이 틀어진 채 계속 울림"},visualTarget:"AudioAnomalyOrb",requiredClicks:1,floatingLabel:"[관리사무소 긴급 안내방송 버퍼링...]"},
  {id:"EE_007",type:"AUDIO",position:{x:130,y:1.5,z:-20},triggerRadius:8.0,audioConfig:{src:"assets/audio/water_fountain_static.mp3",synthFallback:{wave:"sawtooth",baseFreq:160,modFreq:18.0},description:"분수대 물소리가 서서히 TV 백색소음(치지직 소리)으로 변질됨"},visualTarget:"GeometricFountain",requiredClicks:2,floatingLabel:"[수질 센서 응답 없음: 채널 0번]"},
  {id:"EE_008",type:"AUDIO",position:{x:-20,y:1.5,z:-120},triggerRadius:11.0,audioConfig:{src:"assets/audio/fur_elise_parking_alert.mp3",synthFallback:{wave:"triangle",baseFreq:659,modFreq:4.2},description:"지하주차장 출차 알림음 '엘리제를 위하여'가 기괴한 단조로 느리게 재생됨"},visualTarget:"AudioAnomalyOrb",requiredClicks:2,floatingLabel:"[주의: 빠져나갈 수 없는 차량이 출차 중입니다]"},
  {id:"EE_009",type:"AUDIO",position:{x:55,y:1.5,z:-90},triggerRadius:8.0,audioConfig:{src:"assets/audio/cicada_synth_drone.mp3",synthFallback:{wave:"sawtooth",baseFreq:980,modFreq:30.0},description:"여름 매미 울음소리가 기계적인 금속 마찰음으로 바뀌며 귓가를 맴돎"},visualTarget:"LowPolyPineTree",requiredClicks:1,floatingLabel:"[인공 자연환경 사운드트랙 트랙 #09 손상]"},
  {id:"EE_010",type:"AUDIO",position:{x:-95,y:1.5,z:-15},triggerRadius:9.5,audioConfig:{src:"assets/audio/modelhouse_narrator_glitch.mp3",synthFallback:{wave:"sine",baseFreq:260,modFreq:9.0},description:"'당신이 꿈꾸던 미래... 미래... 미래...' 성우의 목소리가 고장 난 CD처럼 튐"},visualTarget:"CyberModelHouseDome",requiredClicks:3,floatingLabel:"[분양 홍보관 나레이션 트랙 무한 루프]"},
  {id:"EE_011",type:"SPATIAL",position:{x:40,y:0,z:25},triggerRadius:10.0,spatialEffect:{mutationType:"GROUND_SWAP_OFFICE_CARPET",groundColor:0x3b4d6b,skyColor:0xd8f0ff,description:"주변 초원 바닥이 갑자기 90년대 회색빛 사무실 카펫 타일로 바뀜"},visualTarget:"SpatialGlitchMonolith",requiredClicks:2,floatingLabel:"[공간 텍스처 오류: OFFICE_FLOOR_02.BMP 로드됨]"},
  {id:"EE_012",type:"SPATIAL",position:{x:-60,y:0,z:-50},triggerRadius:12.0,spatialEffect:{mutationType:"SKY_BSOD_BLUE",groundColor:0x32cd32,skyColor:0x0000aa,description:"파란 하늘이 윈도우 98 블루스크린 색상(#0000AA)으로 급변하고 안개가 짙어짐"},visualTarget:"SpatialGlitchMonolith",requiredClicks:3,floatingLabel:"[FATAL EXCEPTION 0E: 하늘 렌더링 메모리 초과]"},
  {id:"EE_013",type:"SPATIAL",position:{x:90,y:0,z:-45},triggerRadius:11.0,spatialEffect:{mutationType:"INVERT_NEARBY_APARTMENTS",groundColor:0x7cfc00,skyColor:0xffb6c1,description:"주변 미래지향적 아파트 건물이 거꾸로 뒤집혀 지붕이 땅에 박히고 하늘이 분홍빛으로 변함"},visualTarget:"FuturisticAptTowerA",requiredClicks:3,floatingLabel:"[중력 축 반전 구역: 클릭하여 건물 정렬]"},
  {id:"EE_014",type:"SPATIAL",position:{x:-30,y:0,z:80},triggerRadius:9.0,spatialEffect:{mutationType:"GRASS_TO_CONCRETE_PILLARS",groundColor:0x808080,skyColor:0xe0ffff,description:"바람에 흔들리던 풀숲 군락이 순식간에 차가운 회색 콘크리트 기둥 숲으로 치환됨"},visualTarget:"EndlessColonnade",requiredClicks:2,floatingLabel:"[조경 데이터 증발: 콘크리트 기초 말뚝 노출]"},
  {id:"EE_015",type:"SPATIAL",position:{x:115,y:0,z:85},triggerRadius:10.0,spatialEffect:{mutationType:"POOL_TILE_DIMENSION",groundColor:0x00ced1,skyColor:0xffffff,description:"바닥이 실내 수영장 청록색 타일로 바뀌고 주변에 하얀 타일 가벽이 솟아오름"},visualTarget:"TiledMazeWall",requiredClicks:2,floatingLabel:"[단지 내 미개장 지하 수영장 레이어 침범]"},
  {id:"EE_016",type:"SPATIAL",position:{x:-125,y:0,z:-90},triggerRadius:10.5,spatialEffect:{mutationType:"WIREFRAME_WORLD",groundColor:0x001100,skyColor:0x000000,description:"주변 모든 사물의 텍스처가 사라지고 초록색 3D CAD 와이어프레임으로만 표시됨"},visualTarget:"SpatialGlitchMonolith",requiredClicks:3,floatingLabel:"[3DS MAX R4 프리뷰 모드로 강제 전환됨]"},
  {id:"EE_017",type:"SPATIAL",position:{x:0,y:0,z:-65},triggerRadius:8.5,spatialEffect:{mutationType:"GIANT_DUMMY_SHADOW",groundColor:0x556b2f,skyColor:0xfffacd,description:"하늘에 거대한 회색 동그라미 사람 모형(플레이어와 동일한 외형)이 태양처럼 떠서 내려다봄"},visualTarget:"RotatingChromeSphere",requiredClicks:3,floatingLabel:"[관찰자 객체(Scale: 5000%)가 평원을 응시 중]"},
  {id:"EE_018",type:"SPATIAL",position:{x:65,y:0,z:120},triggerRadius:9.5,spatialEffect:{mutationType:"MISSING_TEXTURE_CHECKER",groundColor:0xff00ff,skyColor:0x00ffff,description:"지형과 건물 표면이 마젠타-블랙 결손 텍스처(Missing Texture) 격자무늬로 뒤덮임"},visualTarget:"SpatialGlitchMonolith",requiredClicks:2,floatingLabel:"[경고: GRASS_2003.JPG 파일을 찾을 수 없습니다]"},
  {id:"EE_019",type:"SPATIAL",position:{x:-75,y:0,z:110},triggerRadius:11.0,spatialEffect:{mutationType:"ENDLESS_STAIRS_RISE",groundColor:0xd3d3d3,skyColor:0x87ceeb,description:"평평하던 초원 위로 끝없이 이어지는 허공의 계단 구조물들이 동시다발적으로 솟구침"},visualTarget:"StairwayToNowhere",requiredClicks:2,floatingLabel:"[비상피난계단 배치 알고리즘 폭주]"},
  {id:"EE_020",type:"SPATIAL",position:{x:140,y:0,z:10},triggerRadius:10.0,spatialEffect:{mutationType:"SUNSET_FREEZE_GLITCH",groundColor:0xff4500,skyColor:0x4b0082,description:"절대 해가 지지 않는 낮 시간대인데 갑자기 기괴한 보라색/주황색 저녁노을로 공간이 얼어붙음"},visualTarget:"GoldenEmblemGate",requiredClicks:2,floatingLabel:"[시간 고정핀 이탈: 오후 6시 12분 데이터 침식]"},
  {id:"EE_021",type:"INFO_POPUP",position:{x:15,y:1.5,z:-15},triggerRadius:8.0,visualTarget:"FloatingInfoTerminal",requiredClicks:3,popups:[
    {title:"입주자 카드_302동_1504호.txt",body:"성명: 박진우 (1971년생)\n입주예정일: 2003년 11월 31일 (존재하지 않는 날짜)\n특이사항: 가족들은 모두 입주했으나 본인은 아직 조감도 밖을 서성이고 있음."},
    {title:"냉장고_메모.memo",body:"여보, 냉동실에 2002년 여름에 얼려둔 복숭아 2개 있어. 해동하지 마. 해동하면 거실 창밖 풍경이 지워져."},
    {title:"[시스템 알림]",body:"해당 세대의 창문은 밖에서만 보이고 안에서는 열리지 않습니다. [확인]"}]},
  {id:"EE_022",type:"INFO_POPUP",position:{x:-35,y:1.5,z:-25},triggerRadius:8.0,visualTarget:"FloatingInfoTerminal",requiredClicks:2,popups:[
    {title:"사이버 모델하우스 방명록 #4092",body:"작성자: 이수연 (IP: 211.48.***.12)\n'분양 광고 보러 들어왔는데 출구 버튼이 없어요. 잔디밭이 너무 밝아서 눈이 시려요. 저기 회색 사람 모형은 누구죠?'"},
    {title:"관리자 답글 (2001-09-14)",body:"고객님, 저희 첨단 푸른마을은 100% 쾌적한 영구 조망권을 보장합니다. 지금 보고 계신 회색 모형은 고객님 자신입니다."}]},
  {id:"EE_023",type:"INFO_POPUP",position:{x:50,y:1.5,z:45},triggerRadius:8.5,visualTarget:"FloatingInfoTerminal",requiredClicks:3,popups:[
    {title:"무인택배함_보관기록_08.log",body:"보관함 번호: 14번\n수취인: 101동 000호 김민지\n보관물품: 2004년형 아이리버 프리즘 MP3 플레이어 (전원 켜져 있음)"},
    {title:"장기 미수령 경고",body:"보관 경과 시간: 198,420시간째.\n상자 안에서 계속 이어폰으로 음악 소리가 새어 나오고 있습니다."},
    {title:"수취인 음성 사서함",body:"'지금은 전화를 받을 수 없습니다. 저는 아직 아파트 광고 3초 구간에 머물러 있습니다.'"}]},
  {id:"EE_024",type:"INFO_POPUP",position:{x:-55,y:1.5,z:60},triggerRadius:8.0,visualTarget:"FloatingInfoTerminal",requiredClicks:2,popups:[
    {title:"[분양 카탈로그 인쇄 오류 페이지]",body:"✨21세기 유비쿼터스 웰빙 라이프의 시작!✨\n도보 5분 거리에 초등학교(미구현), 대형마트(텍스처 없음), 끝없는 풀숲(진입 시 귀환 불가)이 위치합니다."},
    {title:"CG 외주 작업자 주석_최종_진짜최종.txt",body:"실장님, 광고주 요청대로 아파트 뒤편에 건물이 더 있는 것처럼 네모 박스 몇 개 대충 세워뒀습니다. 설마 누가 저 뒤까지 걸어가 보진 않겠죠?"}]},
  {id:"EE_025",type:"INFO_POPUP",position:{x:85,y:1.5,z:-10},triggerRadius:9.0,visualTarget:"FloatingInfoTerminal",requiredClicks:3,popups:[
    {title:"엘리베이터_CCTV_캡처_04시44분.bmp",body:"[해상도 160x120 저화질 이미지 텍스트]\n화면 속 엘리베이터 안에 풍선 3개가 천장에 붙어 있고, 바닥에는 어제 날짜의 조간신문만 놓여 있음."},
    {title:"경비실 일지 발췌",body:"03:15 - 205동 앞 벤치에 앉아있던 입주민에게 인사했으나 가까이 가보니 덜 마른 회색 렌더링 더미였음."},
    {title:"경비실 일지 추기",body:"04:00 - 초원 쪽에서 또 이상한 음악이 들려와 귀마개를 착용함. 클릭해서 꺼줄 사람이 필요함."}]},
  {id:"EE_026",type:"INFO_POPUP",position:{x:-15,y:1.5,z:115},triggerRadius:8.0,visualTarget:"FloatingInfoTerminal",requiredClicks:2,popups:[
    {title:"어린이집_알림장_20030612.hwp",body:"오늘 하늘반 친구들과 단지 내 중앙 분수대로 산책을 나갔어요. 유진이가 분수대 물이 만져지지 않고 손이 그냥 통과한다고 울었답니다^^"},
    {title:"학부모 회신란",body:"선생님, 우리 유진이는 작년에 다른 도시로 이사 갔는데요. 지금 거기 있는 아이는 누구인가요?"}]},
  {id:"EE_027",type:"INFO_POPUP",position:{x:105,y:1.5,z:-75},triggerRadius:8.5,visualTarget:"FloatingInfoTerminal",requiredClicks:3,popups:[
    {title:"분실물_습득_공고.jpg",body:"습득장소: 단지 남측 풀숲 3번째 구간\n습득물: 애니콜 폴더폰 (배터리 잔량 1칸), 누군가의 집 열쇠 (열쇠 구멍이 있는 문이 이 월드에 없음)"},
    {title:"폴더폰 임시보관함 문자메시지",body:"[발신: 엄마] 아들, 학원 끝나면 풀숲 쪽으로 가로질러 오지 말고 꼭 보도블록 따라와. 풀숲에 폴리곤 깨진 자리가 있단다."},
    {title:"미전송 답장",body:"엄마 나 이미 풀숲 안인데 사방이 똑같은 초록색이야"}]},
  {id:"EE_028",type:"INFO_POPUP",position:{x:-100,y:1.5,z:-40},triggerRadius:9.0,visualTarget:"FloatingInfoTerminal",requiredClicks:2,popups:[
    {title:"푸른마을_부녀회_공지사항.doc",body:"1. 베란다 밖으로 실재하지 않는 사물을 던지지 마십시오.\n2. 밤 10시 이후에도 태양이 꺼지지 않는 현상은 정상적인 분양 연출이오니 민원을 자제해 주시기 바랍니다."},
    {title:"추가 공지",body:"3. 단지 내 알 수 없는 흰색 타일 건물에 들어간 입주민을 목격하신 분은 즉시 화면을 클릭하여 초기화해 주십시오."}]},
  {id:"EE_029",type:"INFO_POPUP",position:{x:30,y:1.5,z:-110},triggerRadius:8.0,visualTarget:"FloatingInfoTerminal",requiredClicks:3,popups:[
    {title:"청약_당첨자_명단_오류.xls",body:"당첨번호: 0000-0000\n성명: [NULL]\n동·호수: 공중 브릿지 정중앙 허공\n계약 상태: 영구 귀속"},
    {title:"녹취록_분양상담실_02.wav",body:"상담원: '고객님, 이 아파트는 미래지향적 설계라 현관문이 따로 없습니다. 영원히 단지 조경을 감상하시면 됩니다.'"},
    {title:"상담 종료 안내",body:"통화가 종료되었습니다. 창을 모두 닫으면 다시 평화로운 잔디밭으로 돌아갑니다."}]},
  {id:"EE_030",type:"INFO_POPUP",position:{x:-65,y:1.5,z:5},triggerRadius:8.5,visualTarget:"FloatingInfoTerminal",requiredClicks:3,popups:[
    {title:"시스템_메모리_덤프_200X.dmp",body:"현재 시뮬레이션 내 잔존 인원: 1명 (회색 더미)\n초기 이상현상: 30개\n경고: 이상현상을 복구할수록 월드의 외곽에서 새로운 기억 조각이 증식합니다."},
    {title:"누군가의 일기장 마지막 장",body:"'오늘도 조이스틱을 밀어 언덕 너머까지 굴러가 봤다. 아파트는 가까워지지 않고 구름은 어제와 똑같은 픽셀에 멈춰 있다.'"},
    {title:"[복구 확인]",body:"이 창을 터치하면 기록이 은폐되고 광고가 계속 재생됩니다."}]},
];
// 중간중간 계속 생겨나는 실시간 증식용(30 + α) 템플릿 풀
const DYNAMIC_SPAWN_TEMPLATES=[
  {type:"AUDIO",audioConfig:{src:"assets/audio/random_glitch_chime.mp3",synthFallback:{wave:"sawtooth",baseFreq:330,modFreq:14.0},description:"어디선가 울리는 변조된 피아노 학원 연습곡 소리"},visualTarget:"AudioAnomalyOrb",requiredClicks:1,floatingLabel:"[증식된 청각 신호: 체르니 30번_무한루프]"},
  {type:"SPATIAL",spatialEffect:{mutationType:"SKY_NEON_GREEN",groundColor:0x111111,skyColor:0x39ff14,description:"하늘이 형광 초록색으로 번쩍이며 바닥이 어두운 격자로 변함"},visualTarget:"SpatialGlitchMonolith",requiredClicks:2,floatingLabel:"[증식된 공간 균열: 렌더 버퍼 오버플로우]"},
  {type:"INFO_POPUP",visualTarget:"FloatingInfoTerminal",requiredClicks:2,popups:[
    {title:"미확인_입주자_메시지.msg",body:"방금 다른 곳의 이상현상을 끄셨군요. 하지만 여기가 새로 생겨났습니다."},
    {title:"2003년 여름의 잔상",body:"선풍기 바람 소리, 오후 2시의 텅 빈 놀이터, 그리고 끝나지 않는 분양 광고."}]},
];
// The first prototype's records stay in circulation for memories that grow later.
const memoryTexts=[['입주 예정자 명부','101동 1204호 / 강○○\n입주 예정일 : 200X년 6월 21일\n상태 : 아직 도착하지 않음'],['임시 저장된 메모','엄마, 오늘도 날씨가 좋아.\n내일은 꼭 집에 갈게.\n\n마지막 수정 : 200X.06.21 14:00'],['분양 상담 기록','고객 요청 : 해가 잘 드는 집\n특이 사항 : 그림자가 없는 집을 원함\n처리 결과 : 확인 중'],['주민 게시판 #021','혹시 105동을 보신 분 계신가요?\n어제까지는 분명히 네 동이었는데요.'],['자동 응답 메시지','고객님께서 기다리시는 미래는\n아직 연결되지 않았습니다.\n잠시 후 다시 걸어주세요.'],['어느 방문자의 일기','여기 온 적이 있는 것 같다.\n와본 적이 없다는 것도 알고 있다.\n이상하게도 집이 그립지는 않다.'],['관리사무소 공지','금일 오후 2시 이후의 일정은\n등록되어 있지 않습니다.\n오늘도 평온한 하루 보내세요.'],['사진 속성','파일명 : 우리집_최종_진짜최종.jpg\n촬영일 : 내일\n이 사진에 있는 사람 : 0명'],['삭제되지 않은 편지','당신이 온다고 해서\n아직 불을 끄지 않았어요.\n\n보낸 사람 : 알 수 없음'],['엘리베이터 점검표','현재 층 : 14\n목적지 : 14\n이동 시간 : 26년\n이상 없음']];
const typeNames=['이상한 광고 음악','낯선 공간의 틈','누군가의 남겨진 기록'];
const TYPE_INDEX={AUDIO:0,SPATIAL:1,INFO_POPUP:2};

// ─── Ontological beats layered on top of the data ────────────────────────────
// voice: shouted/whispered lines (TTS with subtitles), at: seconds after waking, preset: voice colour.
// Personal tokens: {visitor} {time} {online} {place} {others}
const EGG_EXTRA={
  EE_001:{recipe:'reversedCM',beats:[{at:5,cut:1.1,voice:'행복... 하세요.',preset:'giant'}],click:'다시... 처음부터...'},
  EE_002:{recipe:'intercom',beats:[{at:3.5,voice:'여보세요? 104동 지하... 몇 호세요?',preset:'deep'}],clicks:['거기 있는 거 다 알아요. {visitor}님.','...뚜, 뚜, 뚜.']},
  EE_003:{recipe:'modem',beats:[{at:6,voice:'하아...',preset:'whisper'},{at:6.5,hud:'CONNECT 56000 / {place}'}]},
  EE_004:{recipe:'elevatorHum',loopVoice:{every:6.5,lines:['올라갑니다.','백사십이층입니다.','올라갑니다... 올라갑니다...','내리실 문은 없습니다.'],preset:'announcer'},clicks:['백사십일층입니다.','백사십층입니다.']},
  EE_005:{recipe:'laughter',beats:[{at:2.6,voice:'같이 놀자!',preset:'child'},{at:9,voice:'술래는... 너야.',preset:'child'}],footsteps:true},
  EE_006:{recipe:'chimeDetuned',beats:[{at:4.5,voice:'관리사무소에서 안내 말씀 드립니다. 지금 {place}에 서 계신 회색 입주민께서는, 뒤를 돌아보지 마십시오.',preset:'announcer'}]},
  EE_007:{recipe:'fountainStatic',beats:[{at:4,voice:'물에 손을 넣지 마세요.',preset:'whisper'}]},
  EE_008:{recipe:'furElise',beats:[{at:2,voice:'출차 중입니다. 비켜 주세요.',preset:'announcer'}],ghostCar:true},
  EE_009:{recipe:'cicadaMetal',beats:[{at:5,sting:'screech'}]},
  EE_010:{recipe:'narratorGlitch',loopVoice:{every:5,lines:['당신이 꿈꾸던 미래.','미래... 미래... 미래...','당신이, 당신이, 당신이 꿈꾸던'],preset:'announcer'},skip:true},
  EE_011:{beats:[{at:3,voice:'여기서부터는 업무 공간입니다.',preset:'deep'}]},
  EE_012:{beats:[{at:.4,sting:'bios'},{at:1.2,voice:'치명적인 예외가 발생했습니다.',preset:'giant'}]},
  EE_013:{beats:[{at:2,voice:'위가 아래입니다.',preset:'deep'}]},
  EE_014:{beats:[{at:2.5,voice:'조경 공사가 취소되었습니다.',preset:'announcer'}]},
  EE_015:{beats:[{at:3,voice:'수영장은 아직 개장하지 않았습니다.',preset:'announcer'}]},
  EE_016:{beats:[{at:1.5,voice:'렌더링을 시작합니다.',preset:'deep'}]},
  EE_017:{beats:[{at:3.5,voice:'보고 있어요.',preset:'giant'}],clicks:['아직 보고 있어요.','...이제 당신 차례예요.']},
  EE_018:{beats:[{at:3,voice:'바닥 파일을 찾을 수 없습니다.',preset:'deep'}]},
  EE_019:{beats:[{at:2.5,voice:'비상구는 위쪽입니다. 계속 위쪽입니다.',preset:'announcer'}]},
  EE_020:{beats:[{at:2,voice:'오후 여섯 시 십이 분입니다.',preset:'giant'}]},
  EE_021:{beats:[{at:2,voice:'창문은 밖에서만 보입니다.',preset:'whisper'}]},
  EE_022:{faceCam:true,beats:[{at:4.5,voice:'고객님 자신입니다.',preset:'giant'}]},
  EE_023:{stubborn:1,stubbornText:['상자를 열지 마세요','상자 안의 음악이 당신의 이름을 부르고 있습니다. {visitor}... {visitor}...'],leak:true},
  EE_024:{boxes:true},
  EE_025:{cctv:true,beats:[{at:5.6,voice:'04시 44분. 205동 앞. 한 명 있음.',preset:'deep'}]},
  EE_026:{child:true},
  EE_027:{grassRise:true,beats:[{at:3,voice:'엄마... 여기 다 똑같은 초록색이야.',preset:'child'}]},
  EE_028:{unlockDoor:true},
  EE_029:{beacon:true,beats:[{at:3,voice:'당첨을 축하드립니다. 계약은 영구적입니다.',preset:'announcer'}]},
  EE_030:{extraPopup:{title:'[실시간] 잔존 인원.log',body:'{online}\n{others}\n현재 위치: {place}\n현재 시각: {time}'},beats:[{at:3,voice:'잔존 인원을 확인했습니다.',preset:'deep'}]},
};
// Sudden voices from nowhere. They are short on purpose: the silence before them does the work.
const HALLUCINATIONS=[
  {text:'어디 가세요?',preset:'giant'},{text:'거기 아니에요.',preset:'deep'},{text:'뒤를 돌아보지 마세요.',preset:'whisper'},
  {text:'{visitor}님, 문 열어 주세요.',preset:'deep'},{text:'당신의 집은 아직 지어지지 않았습니다.',preset:'announcer'},
  {text:'분양이 완료되었습니다.',preset:'giant'},{text:'여기 있었어?',preset:'child'},{text:'지금 몇 시예요?',preset:'deep'},
  {text:'102동 1504호. 불이 켜져 있어요.',preset:'whisper'},{text:'다 봤어요.',preset:'giant'},{text:'왜 혼자 왔어요?',preset:'child'},
  {text:'방송을 다시 시작합니다.',preset:'announcer'},{text:'그 손, 누구 거예요?',preset:'whisper'},{text:'내려가지 마세요. 지하에는 하늘이 있어요.',preset:'deep'},
];

