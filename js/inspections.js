// =====================================================================
// INSPECTION MODULE — integrated into Identus-50
// All functions prefixed with "insp", all IDs with "insp-"
// =====================================================================
const INSP_INSPECTION_TYPES = [
  {
    id: 'rough_walls', name: 'Rough In / Walls', num: 1,
    items: [
      'Approved electrical plans available on site',
      'Conduit type and size correct per specifications (EMT, RMC, PVC as required)',
      'NM cable correct gauge per circuit (residential free wire where applicable)',
      'Conduit installed without excessive bends (max 360 degrees total between boxes)',
      'Electrical boxes at correct height per code (receptacles, switches, panels)',
      'Boxes level and flush with finished wall surface',
      'Box fill calculation not exceeded (NEC 314.16)',
      'Circuit count matches approved plans',
      'Power circuits separated from data/communications circuits',
      'Straps/supports every 10 ft or less and within 3 ft of each box (conduit)',
      'Staples within 12" of each box and every 4.5 ft along run (free wire - NEC 334.30)',
      'Cable/conduit protected at penetrations through framing (nail plates where required - NEC 300.4)',
      'No mechanical damage to conduit or cable insulation',
      'Sleeves/penetrations prepared for fire stop',
      'Pull boxes installed where required by code',
      'AFCI/GFCI circuits roughed-in per NEC and Florida Building Code'
    ]
  },
  {
    id: 'overhead_rough', name: 'Overhead Rough', num: 2,
    items: [
      'Approved overhead/ceiling plans available on site',
      'Conduit type correct for location and exposure (EMT, RMC, MC cable as applicable)',
      'NM cable correct type for location - NM-B permitted only in dry areas (residential)',
      'Conduit secured with proper hangers every 10 ft',
      'NM cable supported every 4.5 ft in attic/ceiling space (NEC 334.30)',
      'Minimum 6" separation between electrical and plumbing/mechanical piping',
      'Installation height clear of HVAC, mechanical, and structural conflicts',
      'Communications/data conduit/cable separated from power',
      'No interference with structural members, beams, or ductwork',
      'Rough-in correct for fixtures per plans (position and type)',
      'Recessed fixtures rated IC where insulation is present',
      'Access panels located per plans - minimum 22"x30" per FBC',
      'NM cable protected with guard strips within 6 ft of attic access opening (NEC 334.23)',
      'Junction boxes accessible - not buried or behind finished surfaces',
      'Circuit identification at all junction boxes',
      'Smoke detector rough-in locations per Florida Residential Code R314 (residential)'
    ]
  },
  {
    id: 'fire_stop', name: 'Fire Stop', num: 3,
    items: [
      'All penetrations through fire-rated assemblies identified and documented',
      'Fire stop material is UL Listed and correct for penetration type and assembly rating',
      'Sealant fully applied in fire-rated walls',
      'Sealant fully applied in floor/ceiling assemblies between floors',
      'Sealant thickness per manufacturer specifications',
      'No gaps or voids around conduit or cable at penetrations',
      'Metal conduit sealed internally at penetrations (intumescent plug if required)',
      'Fire blocking installed in stud cavities over 10 ft vertical (FBC R302.11)',
      'Fire blocking at ceiling/floor junctions, soffits, and concealed spaces',
      'Fire stop labels installed at each sealed penetration',
      'Photos taken of each penetration before covering',
      'UL system number documented and visible on site',
      'Area clean and accessible for fire marshal inspection',
      'Fire stop inspector signed approval (if required by AHJ)'
    ]
  },
  {
    id: 'electrical_room', name: 'Electrical Room / Switchboard / Electrical Panel / Load Center', num: 4,
    items: [
      'Approved electrical room plans and single-line diagram available on site',
      'Room dimensions meet minimum working clearance (NEC 110.26 - 36" front, 30" width, 6\'6" height)',
      'Dedicated electrical room - no plumbing, mechanical, or storage permitted',
      'Switchboard/MDP installed level and plumb, anchored to floor/wall per seismic requirements',
      'Bus bar ratings match design (amperes, voltage, interrupting capacity)',
      'Main breaker/disconnect correct size and type per plans',
      'All feeder conduits entering panel sealed (fire stop and weatherproofing where applicable)',
      'Conductors correct gauge, insulation type, and color coding for voltage system',
      'All conductors terminated correctly - proper torque values per manufacturer specs',
      'Neutral and ground buses properly separated and bonded per NEC 250',
      'Grounding electrode system complete and connected (NEC 250.50)',
      'Equipment grounding conductors correct size and connected',
      'Surge protection device (SPD) installed if required per plans (NEC 230.67)',
      'All breakers/fuses installed per panel schedule (type, amperes, position, labeling)',
      'No open slots - all knockouts and openings sealed',
      'Bus bracing rated for available fault current (AIC rating verified)',
      'Metering equipment installed and functional (if applicable)',
      'Panel directory/circuit schedule complete, legible, and correct',
      'Arc flash and shock hazard labels installed (NFPA 70E)',
      'Electrical room door opens outward and is lockable',
      'Adequate lighting inside electrical room (minimum 10 ft-candles - NEC 110.26(D))',
      'Fire extinguisher accessible outside electrical room',
      'As-built single-line diagram posted inside room or in protective sleeve'
    ]
  },
  {
    id: 'pre_power', name: 'Pre Power', num: 5,
    items: [
      'Distribution panel/sub-panel installed and level',
      'Panel size and type per plans (amperes, number of circuits)',
      'Panel secured to adequate structure (not drywall only)',
      'Minimum 36" working clearance in front of panel - clear and unobstructed (NEC 110.26)',
      'Breakers installed per panel schedule (type, amperes, position)',
      'Correct conductors: gauge, insulation type, and color coding',
      'Conductors identified/labeled at both ends',
      'Neutrals and grounds properly separated (in sub-panels)',
      'Grounding electrode conductor installed and connected (NEC 250)',
      'Ground rods installed - minimum 2 rods 6 ft apart (residential NEC 250.53)',
      'Panel and system bonding completed per NEC 250',
      'No loose or unfinished conductors inside panel',
      'Breaker blanks installed - no open slots',
      'Circuit directory complete and legible',
      'AFCI breakers installed where required by NEC 210.12 and Florida amendments',
      'GFCI breakers/receptacles at all required locations (NEC 210.8)',
      'Tamper-resistant receptacles throughout dwelling units (NEC 406.12 - residential)'
    ]
  },
  {
    id: 'hot_check', name: 'Hot Check', num: 6,
    items: [
      'Written authorization to energize received',
      'All circuits identified and labeled before energizing',
      'Continuity test completed before energizing',
      'Megohmmeter (insulation resistance) test completed and documented',
      'Correct voltage at each circuit (120V, 208V, 240V, 480V as applicable)',
      'Voltage balanced between phases (max +/-5% variation)',
      'No reversed circuits (hot/neutral)',
      'Correct polarity at all receptacles',
      'No open grounds at any receptacle',
      'GFCI tested at all required locations - trip and reset functional',
      'AFCI tested with test button - all required circuits',
      'Tamper-resistant receptacles verified functional (residential)',
      'Breakers operating correctly (trip and reset)',
      'No floating neutrals or ground faults',
      'Smoke detector circuits verified - interconnected and functional (residential - FRC R314)',
      'Load current measured and within circuit capacity',
      'Available fault current verified does not exceed equipment AIC rating',
      'Results documented on test form with electrician signature and date'
    ]
  },
  {
    id: 'fire_alarm', name: 'Fire Alarm', num: 7,
    items: [
      'AHJ-approved fire alarm plans available on site',
      'FA control panel installed in approved location',
      'Devices installed per plans (quantity, type, and location)',
      'Smoke detectors in all required rooms and corridors (commercial/industrial)',
      'Smoke alarms in each sleeping room and outside each sleeping area (residential - FRC R314.3)',
      'Heat detectors in kitchens, garages, and areas where smoke detectors are not permitted',
      'Carbon monoxide alarms installed where required (gas appliances or attached garage - Florida)',
      'Pull stations at each required exit (commercial/industrial)',
      'Strobes/horns/speakers at correct locations and heights',
      'All alarms interconnected - when one sounds, all sound (residential - FRC R314.4)',
      'Hardwired with battery backup - no battery-only units (FRC R314.4)',
      'Supervised wiring - Class A or B per design (commercial/industrial)',
      'System programmed with correct zoning (commercial/industrial)',
      'Real smoke test completed on representative sample of detectors',
      'Sound test: dB level verified in sleeping areas (min 75 dB at pillow - NFPA 72)',
      'CO alarm test completed and functional (where required)',
      'Battery backup test: minimum 24hr standby + 5 min alarm (NFPA 72)',
      'Integration with HVAC, elevator, sprinklers verified (commercial/industrial)',
      'Test certificate signed by licensed FA contractor',
      'Programming record and access code delivered to owner'
    ]
  },
  {
    id: 'emergency_light', name: 'Emergency Light', num: 8,
    items: [
      'Approved emergency/exit lighting plans available on site',
      'Emergency light units installed at approved locations',
      'Exit signs installed above each required emergency exit',
      'Exit signs illuminated correctly (letters clearly visible)',
      'Connection to emergency circuit or internal battery verified',
      '30-second test completed (press test button - NFPA 101)',
      '90-minute battery test completed and documented (NFPA 101 7.9.3)',
      'Minimum 1 ft-candle illumination at floor level on entire egress path',
      'Batteries replaced if units are reused (old batteries not permitted)',
      'Test date marked on each unit',
      'Transfer to emergency power verified (simulating power failure)',
      'Egress path unobstructed and clearly illuminated end to end',
      'Signed test certificate filed'
    ]
  },
  {
    id: 'final_inspection', name: 'Final Inspection', num: 9,
    items: [
      'All prior inspections completed and approved',
      'All receptacles correct voltage, polarity, and grounding verified',
      'All switches operating correct devices',
      'All light fixtures functioning correctly',
      'Ceiling fans balanced and operating on all speeds (residential)',
      'Dimmers functioning without flickering or interference',
      'GFCI at all required locations tested - trip and reset functional',
      'AFCI at all required circuits tested with test button',
      'Tamper-resistant receptacles verified throughout (residential)',
      'Smoke alarms interconnected and functional - all sound simultaneously (residential)',
      'CO alarms functional where required',
      'Fire alarm system fully operational - final test witnessed by AHJ (commercial/industrial)',
      'Emergency lights and exit signs operational',
      'Panel no alarms, trips, or disconnected breakers',
      'Panel directory complete, legible, and correct',
      'Arc flash labels in place on electrical room/switchboard (commercial/industrial)',
      'No open electrical boxes without covers throughout',
      'No exposed conduit or cable where not permitted by code',
      'Attic and crawl space wiring properly supported and protected (residential)',
      'Access panels operable and unobstructed',
      'HVAC disconnect correct size and properly labeled',
      'All prior punch list items completed 100%',
      'Permits and inspection cards signed off by AHJ',
      'As-built drawings updated and delivered',
      'Equipment manuals and warranties delivered to owner/GC',
      'Work area clean - no materials, tools, or debris'
    ]
  },
  {
    id: 'underground_electrical', name: 'Underground Electrical', num: 10,
    requiredSystem: 'Underground',
    items: [
      'Approved underground electrical plans and utility layout are available on site (NEC 110.3(B))',
      'The underground route matches the approved plans and site layout',
      'Measure and record the required cover using the applicable row and column of NEC Table 300.5; do not use one fixed depth for every installation',
      'If rock prevents the required cover, the approved raceway and concrete protection are provided as allowed by Table 300.5 (minimum 2 in. concrete where applicable)',
      'The conduit or wiring method is listed and suitable for underground installation (NEC 110.3(B), Chapter 3)',
      'Conductors, cables, terminals, and connections are suitable for damp or wet conditions (NEC 300.5(B), 310.10(C))',
      'Required separation from water, gas, communications, and other utilities is maintained',
      'For applicable underground service conductors, warning ribbon is installed at least 12 in. above the installation when buried 18 in. or more below grade (NEC 300.5(D)(3))',
      'Where wiring emerges from grade, physical protection extends at least 8 ft above finished grade and no more than 18 in. below grade (NEC 300.5(D)(1))',
      'Raceways installed under a building use an approved method and are protected as required (NEC 300.5(C))',
      'Building sleeves, wall penetrations, and raceway ends are sealed against water and gases (NEC 300.5(G), 300.5(J))',
      'Underground boxes and fittings allow drainage and prevent water accumulation (NEC 300.5(B), 314.15)',
      'Bends, pull points, and pull boxes provide safe installation and service access',
      'For angle or U pulls and splices, pull-box dimensions provide at least 6 times the largest raceway trade size, plus added entry distances where required (NEC 314.28)',
      'Conductor sizes match the approved plans, electrical load, overcurrent protection, and voltage-drop requirements',
      'Neutral and equipment-grounding conductors are correctly identified, routed, and terminated (NEC 200.6, 250.119)',
      'Grounding and bonding connections are complete and properly installed (NEC Article 250)',
      'Splices and terminations are inside approved, accessible, and protected enclosures; no unapproved buried splice is present',
      'The installation was inspected, photographed, tested, and approved before backfill; measurements and as-built information are complete'
    ]
  }
];

// DEMO UNITS (101 units)
const INSP_DEMO_UNITS = [];
for (let f = 1; f <= 3; f++) {
  for (let u = 1; u <= 12; u++) {
    const num = `${f}${String(u).padStart(2,'0')}`;
    INSP_DEMO_UNITS.push({ apt: `1${num}`, building: 'Building 1', floor: `Floor ${f}` });
  }
}
for (let f = 1; f <= 3; f++) {
  for (let u = 1; u <= 10; u++) {
    const num = `${f}${String(u).padStart(2,'0')}`;
    INSP_DEMO_UNITS.push({ apt: `2${num}`, building: 'Building 2', floor: `Floor ${f}` });
  }
}
for (let f = 1; f <= 3; f++) {
  for (let u = 1; u <= 10; u++) {
    const num = `${f}${String(u).padStart(2,'0')}`;
    INSP_DEMO_UNITS.push({ apt: `3${num}`, building: 'Building 3', floor: `Floor ${f}` });
  }
}
INSP_DEMO_UNITS.push({ apt: '1U', building: 'Building 1', floor: 'Underground' });
INSP_DEMO_UNITS.push({ apt: '2U', building: 'Building 2', floor: 'Underground' });
INSP_DEMO_UNITS.push({ apt: '3U', building: 'Building 3', floor: 'Underground' });
INSP_DEMO_UNITS.push({ apt: 'CH-001', building: 'Clubhouse', floor: 'N/A' });
INSP_DEMO_UNITS.push({ apt: 'PK-001', building: 'Parking', floor: 'N/A' });
function inspectionEntitySource() { const base=(Array.isArray(window.data)&&window.data.length?window.data:INSP_DEMO_UNITS).filter(u=>u&&(u.apt||u.unit_number)); const areas=(Array.isArray(specialAreaData)?specialAreaData:[]).filter(a=>a&&a.name).map(a=>({...a,apt:a.name,unit_number:a.name,isSpecialArea:true})); return [...base,...areas].filter((u,i,list)=>list.findIndex(x=>String(x.apt||x.unit_number)===String(u.apt||u.unit_number)&&String(x.building)===String(u.building)&&String(x.floor)===String(u.floor))===i); }
function findInspectionEntity(apt) { return inspectionEntitySource().find(u=>String(u.apt||u.unit_number)===String(apt))||INSP_DEMO_UNITS.find(u=>String(u.apt)===String(apt)); }

// STATE
let inspCurrentUnit = null;
let inspCurrentType = null;
let inspChecklistItems = [];
let inspCurrentFailIdx = null;
let inspTempPhotos = [];
let inspTempComment = '';
let inspTempPassIdx = null;
let inspPriorItemsForReinspection = null;
let inspRemoteRecords = [];
let inspRemoteConfig = null;
let inspRemoteReady = false;
let inspRemoteLoadPromise = null;
const inspRemoteDrafts = new Map();

function inspLoadRemoteModuleDataOnce() {
  if (LOCAL_PROJECT_MODE || window.location.protocol === 'file:' || inspRemoteReady) return Promise.resolve();
  if (!inspRemoteLoadPromise) {
    // One automatic retry handles the first-load race without requiring the
    // user to click History or Punch List repeatedly.
    inspRemoteLoadPromise = withTimeout(inspLoadRemoteModuleData(), 15000, 'Inspection data').catch(error => {
      console.warn('Inspection module first load failed; retrying once.', error);
      return withTimeout(inspLoadRemoteModuleData(), 15000, 'Inspection data retry');
    }).catch(error => {
      console.warn('Inspection module could not be loaded after retry.', error);
      // Keep the module retryable. Marking it ready after a failed request
      // made History/Punch List stay empty until a full page refresh.
      inspRemoteLoadPromise = null;
      throw error;
    });
  }
  return inspRemoteLoadPromise;
}

function inspDraftKey() {
  return inspCurrentUnit && inspCurrentType ? `inspection_draft_${inspCurrentUnit.apt}_${inspCurrentType.id}` : '';
}
async function inspSaveDraft() {
  const key = inspDraftKey();
  if (!key || !inspChecklistItems.length) return false;
  const draft = {
    savedAt: new Date().toISOString(),
    apt: inspCurrentUnit.apt,
    building: inspCurrentUnit.building,
    floor: inspCurrentUnit.floor,
    typeId: inspCurrentType.id,
    type: inspCurrentType.name,
    inspector: inspGetCurrentInspector(),
    items: inspChecklistItems
  };
  if (!LOCAL_PROJECT_MODE && window.location.protocol !== 'file:') {
    inspRemoteDrafts.set(key, draft);
    await inspPersistRemoteDraft(draft);
    return true;
  }
  localStorage.setItem(key, JSON.stringify(draft));
  return true;
}
function inspLoadDraft() {
  const key = inspDraftKey();
  if (!key) return false;
  try {
    const draft = (LOCAL_PROJECT_MODE || window.location.protocol === 'file:') ? JSON.parse(localStorage.getItem(key) || 'null') : inspRemoteDrafts.get(key);
    if (!draft || !Array.isArray(draft.items)) return false;
    inspChecklistItems = inspCurrentType.items.map((description, i) => ({
      status: draft.items[i]?.status || null,
      comment: draft.items[i]?.comment || '',
      photos: draft.items[i]?.photos || []
    }));
    return true;
  } catch (e) { return false; }
}
function inspClearDraft() {
  const key = inspDraftKey();
  if (!key) return;
  if (!LOCAL_PROJECT_MODE && window.location.protocol !== 'file:') {
    inspRemoteDrafts.delete(key);
    inspDeleteRemoteDraft().catch(error => console.error('Remote draft delete failed:', error));
    return;
  }
  localStorage.removeItem(key);
}
async function inspSaveDraftAndReturn() {
  try {
    await inspSaveDraft();
  } catch (error) {
    inspShowToast(`Draft could not be saved: ${error.message || 'connection error'}`, 'error');
    return;
  }
  const isSpanish = (localStorage.getItem('cfg_language') || 'en') === 'es';
  inspShowToast(isSpanish ? 'Borrador guardado. Puedes retomar esta inspección después.' : 'Draft saved. You can resume this inspection later.', 'success');
  inspReturnToTypeList();
}
function inspCancelInspection() {
  const isSpanish = (localStorage.getItem('cfg_language') || 'en') === 'es';
  if (!window.confirm(isSpanish ? '¿Cancelar esta inspección? Los cambios no guardados se descartarán.' : 'Cancel this inspection? Unsaved changes will be discarded.')) return;
  inspClearDraft();
  inspChecklistItems = [];
  inspShowToast(isSpanish ? 'Inspección cancelada.' : 'Inspection canceled.', 'success');
  inspReturnToTypeList();
}

async function inspLoadRemoteModuleData() {
  if (LOCAL_PROJECT_MODE || window.location.protocol === 'file:' || !sbClient) return;
  const seedRows = INSP_INSPECTION_TYPES.map(type => ({
    project_id: PROJECT_ID,
    code: type.id,
    name_en: type.name,
    name_es: type.name,
    display_order: type.num,
    checklist_items: type.items,
    is_active: true,
    updated_at: new Date().toISOString()
  }));
  let { data: typeRows, error: typeError } = await sbClient
    .from('inspection_types').select('id,code,name_en,name_es,display_order,is_active')
    .eq('project_id', PROJECT_ID).eq('is_active', true).order('display_order');
  if (typeError) {
    throw typeError;
  }
  const existingCodes = new Set((typeRows || []).map(row => row.code));
  const missingSeedRows = seedRows.filter(row => !existingCodes.has(row.code));
  if (missingSeedRows.length) {
    const { error: seedError } = await sbClient.from('inspection_types').upsert(missingSeedRows, { onConflict: 'project_id,code' });
    if (seedError) {
      console.warn('Inspection type seed unavailable; keeping existing records.', seedError);
    } else {
      const refreshed = await sbClient.from('inspection_types').select('id,code,name_en,name_es,display_order,is_active')
        .eq('project_id', PROJECT_ID).eq('is_active', true).order('display_order');
      if (refreshed.error) console.warn('Inspection type refresh unavailable.', refreshed.error);
      else typeRows = refreshed.data || [];
    }
  }
  let assignmentQuery = sbClient.from('building_inspection_types').select('building_id,inspection_type_id,floor,is_enabled').eq('project_id', PROJECT_ID).eq('is_enabled', true);
  let assignmentResult = await assignmentQuery;
  if (assignmentResult.error && /floor.*schema cache|column.*floor/i.test(assignmentResult.error.message || '')) {
    assignmentResult = await sbClient.from('building_inspection_types').select('building_id,inspection_type_id,is_enabled').eq('project_id', PROJECT_ID).eq('is_enabled', true);
  }
  const [{ data: assignmentRows, error: assignmentError }, { data: recordRows, error: recordError }] = [assignmentResult, await sbClient.from('inspection_records').select('id,unit_id,inspection_type_id,inspector_id,inspector_name,status,revision_number,parent_record_id,pass_count,fail_count,na_count,total_count,submitted_at,created_at,updated_at').eq('project_id', PROJECT_ID).order('created_at', { ascending: true })];
  if (recordError) {
    throw recordError;
  }
  // Building/type assignments only control applicability; they are optional
  // for displaying saved History and Punch List records.
  if (assignmentError) console.warn('Inspection assignments unavailable; continuing with saved records.', assignmentError);

  const typesById = new Map((typeRows || []).map(row => [row.id, row]));
  const buildingNames = new Map((Array.isArray(data) ? data : []).map(unit => [unit.building_id, unit.building]));
  const config = {};
  (assignmentRows || []).forEach(row => {
    const type = typesById.get(row.inspection_type_id);
    const building = buildingNames.get(row.building_id);
    if (!type || !building) return;
    if (!config[type.code]) config[type.code] = [];
    config[type.code].push(row.floor ? building + '::' + row.floor : building);
  });
  inspRemoteConfig = config;

  // Failed records are needed immediately to build Punch List. Passed/N/A
  // records keep only their summary until the user opens View, which avoids
  // transferring every checklist row and photo URL during startup.
  const detailRecordIds = (recordRows || []).filter(row => Number(row.fail_count || 0) > 0).map(row => row.id);
  let itemRows = [];
  if (detailRecordIds.length) {
    // Startup only needs failed-item text and photo counts. Full photo URLs
    // remain lazy and are fetched by inspEnsureRecordItems() when View opens.
    let itemResult = await sbClient.from('inspection_record_items')
      .select('inspection_record_id,item_index,description,status,comment,photo_count')
      .in('inspection_record_id', detailRecordIds);
    // Compatibility with projects before the additive column migration.
    // Do not fall back to photo_urls here: legacy rows can contain large
    // base64 arrays. View fetches those URLs lazily for the selected record.
    if (itemResult.error && /photo_count|column/i.test(itemResult.error.message || '')) {
      itemResult = await sbClient.from('inspection_record_items')
        .select('inspection_record_id,item_index,description,status,comment')
        .in('inspection_record_id', detailRecordIds);
    }
    if (itemResult.error) console.warn('Inspection item details unavailable; showing record history without item details.', itemResult.error);
    else itemRows = itemResult.data || [];
  }
  const itemsByRecord = new Map();
  itemRows.forEach(item => {
    if (!itemsByRecord.has(item.inspection_record_id)) itemsByRecord.set(item.inspection_record_id, []);
    itemsByRecord.get(item.inspection_record_id).push({
      idx: item.item_index,
      description: item.description,
      status: item.status ? String(item.status).toUpperCase() : null,
      comment: item.comment || '',
      // URL arrays stay empty during startup; View loads them on demand.
      photos: Array.isArray(item.photo_urls) ? item.photo_urls : [],
      photoCount: Number(item.photo_count ?? (Array.isArray(item.photo_urls) ? item.photo_urls.length : 0))
    });
  });
  const unitById = new Map((Array.isArray(data) ? data : []).map(unit => [unit.id, unit]));
  const loadedDetailIds = new Set(detailRecordIds.map(id => String(id)));
  inspRemoteRecords = (recordRows || []).map(row => {
    const unit = unitById.get(row.unit_id) || {};
    const type = typesById.get(row.inspection_type_id) || {};
    const items = (itemsByRecord.get(row.id) || []).sort((a, b) => a.idx - b.idx);
    return {
      id: row.id,
      unitId: row.unit_id,
      apt: unit.apt || '',
      building: unit.building || '',
      floor: unit.floor || '',
      typeId: type.code || '',
      type: type.name_en || '',
      typeNum: type.display_order || '',
      inspector: row.inspector_name || 'Current User',
      date: row.submitted_at || row.created_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.submitted_at,
      revision: row.revision_number || 1,
      isReinspection: Boolean(row.parent_record_id),
      parentInspectionId: row.parent_record_id,
      totalCount: row.total_count || items.length,
      passCount: row.pass_count || 0,
      failedCount: row.fail_count || 0,
      naCount: row.na_count || 0,
      items,
      _itemsLoaded: loadedDetailIds.has(String(row.id))
    };
  });
  const { data: authData } = await sbClient.auth.getUser();
  const inspectorId = authData?.user?.id;
  if (inspectorId) {
    const { data: draftRows, error: draftError } = await sbClient.from('inspection_drafts').select('unit_id,inspection_type_id,payload').eq('project_id', PROJECT_ID).eq('inspector_id', inspectorId);
    // Drafts are optional. A permissions/RLS issue here must not hide saved
    // inspection history or prevent inspection failures from reaching Punch List.
    if (draftError) console.warn('Inspection drafts unavailable; continuing with saved records.', draftError);
    (draftRows || []).forEach(row => {
      const unit = unitById.get(row.unit_id);
      const type = typesById.get(row.inspection_type_id);
      if (!unit || !type || !row.payload) return;
      inspRemoteDrafts.set(`inspection_draft_${unit.apt}_${type.code}`, row.payload);
    });
  }
  inspRemoteReady = true;
  // Inspection failures are also represented in the Dashboard Punch List.
  // Rebuild that view after remote records/items finish loading so startup
  // order cannot leave the Dashboard empty until the next refresh.
  if (typeof syncInspectionFailuresToPunchlist === 'function') {
    syncInspectionFailuresToPunchlist();
    if (typeof renderPunchlist === 'function') renderPunchlist();
    if (typeof inspLoadPunchList === 'function') inspLoadPunchList();
    if (typeof updateMetrics === 'function') updateMetrics();
    if (typeof updateCharts === 'function') updateCharts();
  }
  // If the user opened one of these tabs before the remote load completed,
  // refresh the visible list now instead of requiring a tab switch.
  if (document.getElementById('insp-tab-history')?.style.display !== 'none' && typeof inspLoadHistory === 'function') {
    inspLoadHistory();
  }
  if (document.getElementById('insp-tab-punchlist')?.style.display !== 'none' && typeof inspLoadPunchList === 'function') {
    inspLoadPunchList();
  }
}

function inspGetInspections() {
  if (!LOCAL_PROJECT_MODE && window.location.protocol !== 'file:') {
    const list = Array.isArray(inspRemoteRecords) ? inspRemoteRecords : [];
    // Records can load before the unit list; fill the unit name once it is known.
    if (list.some(r => !r.apt && r.unitId)) {
      let units = []; try { units = [...(Array.isArray(data) ? data : []), ...(typeof inspectionEntitySource === 'function' ? inspectionEntitySource() : [])]; } catch (_) {}
      const byId = new Map(units.filter(u => u && u.id).map(u => [String(u.id), u]));
      list.forEach(r => { if (!r.apt && r.unitId) { const u = byId.get(String(r.unitId)); if (u) { r.apt = u.apt || u.unit_number || ''; r.building = r.building || u.building || ''; r.floor = r.floor || u.floor || ''; } } });
    }
    return list;
  }
  try { return JSON.parse(localStorage.getItem('inspections_data') || '[]'); } catch(e) { return []; }
}

async function inspEnsureRecordItems(recordOrId) {
  const record = typeof recordOrId === 'object'
    ? recordOrId
    : inspGetInspections().find(item => String(item.id) === String(recordOrId));
  if (!record || record._itemsLoaded || LOCAL_PROJECT_MODE || window.location.protocol === 'file:' || !sbClient) return record;
  if (record._itemsPromise) return record._itemsPromise;
  record._itemsPromise = sbClient.from('inspection_record_items')
    .select('inspection_record_id,item_index,description,status,comment,photo_urls')
    .eq('inspection_record_id', record.id)
    .order('item_index', { ascending: true })
    .then(({ data: rows, error }) => {
      if (error) throw error;
      record.items = (rows || []).map(item => ({
        idx: item.item_index,
        description: item.description,
        status: item.status ? String(item.status).toUpperCase() : null,
        comment: item.comment || '',
        photos: Array.isArray(item.photo_urls) ? item.photo_urls : []
      }));
      record._itemsLoaded = true;
      delete record._itemsPromise;
      return record;
    })
    .catch(error => {
      delete record._itemsPromise;
      throw error;
    });
  return record._itemsPromise;
}

async function inspPersistRemoteRecord(record) {
  if (LOCAL_PROJECT_MODE || window.location.protocol === 'file:' || !sbClient || !record) return;
  const unit = (Array.isArray(data) ? data : []).find(u => String(u.apt) === String(record.apt));
  if (!unit?.id) throw new Error('The selected unit is not synchronized with Supabase.');
  const { data: typeRows, error: typeError } = await sbClient.from('inspection_types').select('id,code').eq('project_id', PROJECT_ID).eq('code', record.typeId).limit(1);
  if (typeError) throw typeError;
  const typeRow = typeRows?.[0];
  if (!typeRow) throw new Error(`Inspection type ${record.typeId} is not configured in Supabase.`);
  const { data: authData } = await sbClient.auth.getUser();
  const payload = {
    project_id: PROJECT_ID,
    unit_id: unit.id,
    building_id: unit.building_id,
    inspection_type_id: typeRow.id,
    inspector_id: authData?.user?.id || null,
    inspector_name: record.inspector,
    status: record.failedCount > 0 ? 'submitted' : 'completed',
    revision_number: record.revision || 1,
    parent_record_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(record.parentInspectionId || '') ? record.parentInspectionId : null,
    pass_count: record.passCount || 0,
    fail_count: record.failedCount || 0,
    na_count: record.naCount || 0,
    total_count: record.totalCount || 0,
    submitted_at: record.date,
    updated_at: new Date().toISOString()
  };
  const { data: saved, error } = await sbClient.from('inspection_records').insert(payload).select('id').single();
  if (error) throw error;
  record.id = saved.id;
  // Inspection photos are large and must not be persisted as base64 in
  // Postgres. Upload data URLs to Storage first, then save only URLs in the
  // checklist rows. Existing records remain readable and are migrated lazily
  // when they are opened.
  const itemPayload = [];
  for (const item of (record.items || [])) {
    const photos = [];
    for (let photoIndex = 0; photoIndex < (Array.isArray(item.photos) ? item.photos.length : 0); photoIndex++) {
      const photo = item.photos[photoIndex];
      if (typeof photo === 'string' && photo.startsWith('data:')) {
        const path = `inspection-photos/${PROJECT_ID}/${saved.id}/item_${item.idx}_${photoIndex}_${Math.random().toString(36).slice(2, 8)}.jpg`;
        photos.push(await uploadToStorage(photo, path, 'image/jpeg'));
      } else if (photo) {
        photos.push(photo);
      }
    }
    itemPayload.push({
      inspection_record_id: saved.id,
      item_index: item.idx,
      description: item.description,
      status: item.status ? String(item.status).toLowerCase() : null,
      comment: item.comment || '',
      photo_urls: photos
    });
  }
  if (itemPayload.length) {
    const { error: itemError } = await sbClient.from('inspection_record_items').insert(itemPayload);
    if (itemError) throw itemError;
  }
}

async function inspPersistRemoteDraft(draft) {
  if (LOCAL_PROJECT_MODE || window.location.protocol === 'file:' || !sbClient || !draft) return;
  const unit = (Array.isArray(data) ? data : []).find(u => String(u.apt) === String(draft.apt));
  if (!unit?.id) return;
  const { data: typeRows, error: typeError } = await sbClient.from('inspection_types').select('id,code').eq('project_id', PROJECT_ID).eq('code', draft.typeId).limit(1);
  if (typeError) throw typeError;
  const typeRow = typeRows?.[0];
  if (!typeRow) return;
  const { data: authData } = await sbClient.auth.getUser();
  const inspectorId = authData?.user?.id;
  if (!inspectorId) return;
  const { error } = await sbClient.from('inspection_drafts').upsert({
    project_id: PROJECT_ID,
    unit_id: unit.id,
    inspection_type_id: typeRow.id,
    inspector_id: inspectorId,
    payload: draft,
    updated_at: new Date().toISOString()
  }, { onConflict: 'unit_id,inspection_type_id,inspector_id' });
  if (error) throw error;
}

async function inspDeleteRemoteDraft() {
  if (LOCAL_PROJECT_MODE || window.location.protocol === 'file:' || !sbClient || !inspCurrentUnit || !inspCurrentType) return;
  const unit = (Array.isArray(data) ? data : []).find(u => String(u.apt) === String(inspCurrentUnit.apt));
  const { data: typeRows } = await sbClient.from('inspection_types').select('id,code').eq('project_id', PROJECT_ID).eq('code', inspCurrentType.id).limit(1);
  const { data: authData } = await sbClient.auth.getUser();
  const inspectorId = authData?.user?.id;
  const typeRow = typeRows?.[0];
  if (!unit?.id || !typeRow?.id || !inspectorId) return;
  const { error } = await sbClient.from('inspection_drafts').delete().eq('unit_id', unit.id).eq('inspection_type_id', typeRow.id).eq('inspector_id', inspectorId);
  if (error) throw error;
}
function inspGetCurrentInspector() {
  const localPreview = LOCAL_PROJECT_MODE || window.location.protocol === 'file:';
  return String(window.userName || (localPreview ? localStorage.getItem('cfg_user_name') || localStorage.getItem('user_name') : '') || 'Current User').trim();
}
function inspApplyCurrentInspector() {
  const select = document.getElementById('insp-inspector-select');
  if (!select) return;
  const name = inspGetCurrentInspector();
  select.innerHTML = `<option value="${name.replace(/"/g, '&quot;')}">${name}</option>`;
  select.value = name;
  select.disabled = true;
  select.style.display = 'none';
  select.title = 'Inspector is the signed-in user';
  let label = document.getElementById('insp-current-inspector-label');
  if (!label) {
    label = document.createElement('span');
    label.id = 'insp-current-inspector-label';
    label.style.cssText = 'font-size:12px;color:#64748b;margin-left:10px;white-space:nowrap';
    select.parentElement?.appendChild(label);
  }
  label.textContent = `Inspector: ${name}`;
}
function inspEnglishize() {
  ['#inspectionsTab', '#insp-fail-modal', '#insp-retake-modal'].forEach(selector => {
    const root = document.querySelector(selector);
    if (!root) return;
    let html = root.innerHTML;
    const replacements = [
      [/Inspecciones/gi, 'Inspections'], [/Inspección/gi, 'Inspection'], [/InspecciÃ³n/gi, 'Inspection'],
      [/Buscar Unidad/gi, 'Search Unit'], [/Unidad/gi, 'Unit'],
      [/Historial/gi, 'History'], [/Sin inspecciones/gi, 'No inspections'],
      [/Aún no hay inspecciones registradas/gi, 'No inspections recorded yet'],
      [/Sin fallos registrados/gi, 'No failures recorded'],
      [/Todas las inspecciones han pasado/gi, 'All inspections passed'],
      [/Fallos de Inspección/gi, 'Inspection Failures'], [/Fallo/gi, 'Failure'], [/fallo/gi, 'failure'],
      [/fallo\(s\)/gi, 'failure(s)'], [/Fallo\(s\)/gi, 'Failure(s)'],
      [/fallos registrados/gi, 'failures recorded'], [/falla(s)/gi, 'failure(s)'],
      [/Completado/gi, 'Completed'], [/completada/gi, 'completed'],
      [/completado/gi, 'completed'], [/Tipos de Inspección por Área/gi, 'Inspection Types by Area'],
      [/No hay tipos de inspección configurados para este edificio/gi, 'No inspection types are configured for this building'],
      [/Revisa el Project Setup/gi, 'Check Project Setup'], [/ítem seleccionado/gi, 'Selected item'],
      [/Ítems con Fallo/gi, 'Failed Items'], [/PUNCH LIST/gi, 'PUNCH LIST'],
      [/guardada/gi, 'saved'], [/guardadas/gi, 'saved'], [/exitosamente/gi, 'successfully'],
      [/Nueva inspección/gi, 'New inspection'], [/nueva inspección/gi, 'new inspection'],
      [/Registrar Fallo/gi, 'Report Failure'], [/Registrar Failure/gi, 'Report Failure'], [/Comentario/gi, 'Comment'],
      [/Descripción del Problema/gi, 'Problem Description'],
      [/Fotos de Evidencia/gi, 'Evidence Photos'], [/Cancelar/gi, 'Cancel'],
      [/Confirmar Fallo/gi, 'Confirm Failure'], [/Confirmar Failure/gi, 'Confirm Failure'], [/Describe el problema encontrado/gi, 'Describe the problem found'], [/Toca para agregar fotos/gi, 'Click to add photos'],
      [/puedes agregar varias/gi, 'multiple allowed'], [/ítems/gi, 'items'],
      [/respondidos/gi, 'answered'], [/Resumen/gi, 'Summary'],
      [/Retomar/gi, 'Resume'], [/retomar/gi, 'resume'], [/Nueva/gi, 'New'], [/nueva/gi, 'new'], [/Ver Historial/gi, 'View History'],
      [/Ver Punch List/gi, 'View Punch List'], [/Actualizar/gi, 'Refresh'], [/Actualiza/gi, 'Refresh'],
      [/Registrar Fallo/gi, 'Report Failure'], [/Toca para agregar fotos/gi, 'Click to add photos'],
      [/puedes agregar varias/gi, 'multiple allowed'], [/Cancelar/gi, 'Cancel'], [/Confirmar Fallo/gi, 'Confirm Failure'],
      [/Descripción del Problema/gi, 'Problem Description'], [/DescripciÃ³n del Problema/gi, 'Problem Description'],
      [/Fotos de Evidencia/gi, 'Evidence Photos'], [/foto\(s\)/gi, 'photo(s)'], [/respondidos/gi, 'answered'],
      [/Unidad/gi, 'Unit'], [/Sin inspecciones/gi, 'No inspections'], [/AÃºn no hay inspecciones registradas/gi, 'No inspections recorded yet'],
      [/Sin fallos registrados/gi, 'No failures recorded'], [/Todas las inspecciones han pasado/gi, 'All inspections passed'],
      [/HISTORIAL/gi, 'HISTORY'], [/NUEVA INSPECCIÃ“N/gi, 'NEW INSPECTION'], [/Ãtems con Fallo/gi, 'Failed Items'],
      [/correcciÃ³n/gi, 'correction'], [/PUNCH LIST â€” este Ã­tem serÃ¡ agregado automÃ¡ticamente/gi, 'PUNCH LIST — this item will be added automatically'],
      [/Continuar o nueva inspección/gi, 'Resume or start a new inspection'],
      [/Existe una inspección previa/gi, 'A previous inspection exists'],
      [/Deseas retomar con las respuestas anteriores o comenzar desde cero/gi, 'Would you like to resume with the previous answers or start over'],
      [/Nueva/gi, 'New'], [/fecha anterior/gi, 'previous date'],
      [/items con Failure/gi, 'Failure Items'], [/pendiente\(s\) de correcci.n/gi, 'Pending correction item(s)'], [/Ver en PUNCH LIST/gi, 'View in PUNCH LIST'],
      [/Unidad\s+/gi, 'Unit '], [/Edificio/gi, 'Building'], [/Piso/gi, 'Floor'], [/Buscar/gi, 'Search'],
      [/No comenzado/gi, 'Not Started'], [/No iniciado/gi, 'Not Started'], [/Pendientes/gi, 'Pending items'],
      [/Completada/gi, 'Completed'], [/Comentario/gi, 'Comment'], [/Descripci.n/gi, 'Description'],
      [/Fotos/gi, 'Photos'], [/Cerrar/gi, 'Close'], [/Volver/gi, 'Back'], [/Error/gi, 'Error']
    ];
    replacements.forEach(([pattern, value]) => { html = html.replace(pattern, value); });
    root.innerHTML = html;
  });
  inspNormalizeNavButtons();
}
function inspNormalizeNavButtonsLegacy() {
  const root = document.getElementById('inspectionsTab');
  if (!root) return;
  root.querySelectorAll('button').forEach(button => {
    const label = (button.textContent || '').trim().toLowerCase();
    if (label.includes('back') || label.includes('â†') || label.includes('←')) {
      button.textContent = '↩';
      button.title = 'Back';
      button.setAttribute('aria-label', 'Back');
      button.classList.add('insp-icon-nav');
    } else if (label.includes('close')) {
      button.textContent = '×';
      button.title = 'Close';
      button.setAttribute('aria-label', 'Close');
      button.classList.add('insp-icon-nav');
    }
  });
  if (!root._inspNavObserver) {
    root._inspNavObserver = new MutationObserver(() => {
      root.querySelectorAll('button').forEach(button => {
        const label = (button.textContent || '').trim().toLowerCase();
        if (label.includes('back') || label.includes('â†') || label.includes('←')) {
          button.textContent = '↩'; button.title = 'Back'; button.setAttribute('aria-label', 'Back'); button.classList.add('insp-icon-nav');
        } else if (label.includes('close')) {
          button.textContent = '×'; button.title = 'Close'; button.setAttribute('aria-label', 'Close'); button.classList.add('insp-icon-nav');
        }
      });
    });
    root._inspNavObserver.observe(root, { childList:true, subtree:true });
  }
  if (!document.body._inspGlobalNavObserver) {
    const normalizeGlobal = () => {
      document.querySelectorAll('#inspectionsTab button, #insp-fail-modal button, #insp-retake-modal button, .insp-summary-popup button').forEach(button => {
        const label = (button.textContent || '').trim().toLowerCase();
        if (label.includes('back') || label.includes('â†') || label.includes('←')) {
          button.textContent = '↩'; button.title = 'Back'; button.setAttribute('aria-label', 'Back'); button.classList.add('insp-icon-nav');
        } else if (label.includes('close')) {
          button.textContent = '×'; button.title = 'Close'; button.setAttribute('aria-label', 'Close'); button.classList.add('insp-icon-nav');
        }
      });
    };
    document.body._inspGlobalNavObserver = new MutationObserver(normalizeGlobal);
    document.body._inspGlobalNavObserver.observe(document.body, { childList:true, subtree:true });
    normalizeGlobal();
  }
}
async function inspSaveInspections(arr) {
  if (!LOCAL_PROJECT_MODE && window.location.protocol !== 'file:') {
    inspRemoteRecords = Array.isArray(arr) ? arr : [];
    const latest = inspRemoteRecords[inspRemoteRecords.length - 1];
    if (latest) await inspPersistRemoteRecord(latest);
    return true;
  }
  const records = Array.isArray(arr) ? arr : [];
  try {
    localStorage.setItem('inspections_data', JSON.stringify(records));
    return true;
  } catch (error) {
    // A previous inspection may contain large base64 photos. Remove only the
    // duplicated remote cache and retry before reporting a real storage error.
    try { localStorage.removeItem('identus_remote_data_cache'); } catch (_) {}
    try {
      localStorage.setItem('inspections_data', JSON.stringify(records));
      return true;
    } catch (retryError) {
      console.warn('Inspection history exceeds local storage; saving a compact history.', retryError);
      const compact = records.map(record => ({
        ...record,
        items: Array.isArray(record.items) ? record.items.map(item => ({
          ...item,
          photos: [],
          photoCount: item.photoCount || (Array.isArray(item.photos) ? item.photos.length : 0)
        })) : record.items
      }));
      try {
        localStorage.setItem('inspections_data', JSON.stringify(compact));
        return true;
      } catch (finalError) {
        console.error('Inspection history could not be saved locally:', finalError);
        return false;
      }
    }
  }
}

function inspShowSummaryPopup() {
  const summary = document.getElementById('insp-step-summary');
  if (!summary || document.querySelector('.insp-summary-popup')) return;
  const placeholder = document.createComment('inspection-summary-placeholder');
  summary.parentNode.insertBefore(placeholder, summary);
  const overlay = document.createElement('div');
  overlay.className = 'insp-summary-popup';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(15,23,42,.42);opacity:0;transition:opacity .2s ease;';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Inspection Summary');
  overlay.appendChild(summary);
  document.body.appendChild(overlay);
  summary._inspPopupStyle = summary.getAttribute('style') || '';
  summary.classList.remove('hidden');
  summary.style.cssText += ';display:block;width:min(920px,96vw);max-height:92vh;overflow:auto;transform:translateY(10px) scale(.985);transition:transform .2s ease;box-shadow:0 20px 60px rgba(15,23,42,.25);';
  summary._inspPopupPlaceholder = placeholder;
  overlay.addEventListener('click', event => { if (event.target === overlay) inspCloseSummaryPopup(); });
  requestAnimationFrame(() => { overlay.classList.add('show'); overlay.style.opacity = '1'; summary.style.transform = 'translateY(0) scale(1)'; });
  inspNormalizeNavButtons();
  inspUseSingleCloseControl();
  const summaryControls = summary.querySelector('.insp-summary-controls');
  if (summaryControls) {
    const buttons = summaryControls.querySelectorAll('button');
    if (buttons.length) buttons[buttons.length - 1].onclick = inspCloseSummaryView;
  }
}

function inspCloseSummaryPopup() {
  const overlay = document.querySelector('.insp-summary-popup');
  const summary = overlay?.querySelector('#insp-step-summary');
  if (!overlay || !summary) return;
  const placeholder = summary._inspPopupPlaceholder;
  overlay.classList.remove('show');
  overlay.style.opacity = '0';
  summary.style.transform = 'translateY(10px) scale(.985)';
  setTimeout(() => {
    if (placeholder?.parentNode) placeholder.parentNode.insertBefore(summary, placeholder.nextSibling);
    else document.getElementById('inspectionsTab')?.appendChild(summary);
    summary.setAttribute('style', summary._inspPopupStyle || '');
    overlay.remove();
  }, 520);
}

// TABS
function inspCaptureReturnContext() {
  const details = document.getElementById('detailsModal');
  if (details?.classList.contains('show')) return 'unit';
  const main = document.querySelector('.tab-main.active')?.getAttribute('onclick') || '';
  if (main.includes("'inspections'")) {
    const active = document.querySelector('#inspectionsTab .insp-tab.active')?.getAttribute('onclick') || '';
    if (active.includes("'history'")) return 'history';
    if (active.includes("'punchlist'")) return 'punchlist';
    if (active.includes("'report'")) return 'report';
  }
  return 'dashboard';
}

function inspQuickStart() {
  // Preserve the view from which the new inspection was opened.
  window.inspReturnAfterInspection = inspCaptureReturnContext();
  // Switch to inspections tab
  const inspBtn = document.querySelector('.tab-main[onclick*="inspections"]');
  switchMainTab('inspections', inspBtn);
  // Go to Nueva tab, step 1 (unit search)
  inspShowTab('new');
  inspGoStep(1);
}

function openQuickInspectionModal() {
  let modal = document.getElementById('quickInspectionModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quickInspectionModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width:520px">
        <form onsubmit="startQuickInspection(event)">
          <div class="modal-header">
            <h2>Quick Inspection</h2>
            <button class="modal-close" type="button" onclick="closeQuickInspectionModal()">✕</button>
          </div>
          <div class="form-group" style="position:relative;">
            <label class="form-label">Unit Number</label>
            <input type="search" class="form-input" id="quickInspectionUnitSearch"
              placeholder="Search unit number or name..." autocomplete="off" inputmode="text" enterkeyhint="search"
              oninput="filterQuickInspectionUnits()" onfocus="filterQuickInspectionUnits()" required>
            <div id="quickInspectionUnitSuggestions" class="suggestions-list"></div>
            <input type="hidden" id="quickInspectionUnit">
          </div>
          <div id="quickInspectionHint" style="font-size:12px;color:#64748b;margin:12px 0 4px;">
            Select a unit to view its available inspection cards and current progress.
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeQuickInspectionModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">View Inspections</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);
  }
  const units = inspectionEntitySource()
    .filter(u => u && (u.apt || u.unit_number))
    .map(u => ({ apt:String(u.apt || u.unit_number), building:String(u.building || ''), floor:String(u.floor || '') }))
    .filter((u, i, list) => list.findIndex(x => x.apt === u.apt) === i)
    .sort((a, b) => a.apt.localeCompare(b.apt, undefined, { numeric:true }));
  const unitSearch = document.getElementById('quickInspectionUnitSearch');
  const unitSelect = document.getElementById('quickInspectionUnit');
  if (!unitSearch || !unitSelect) return;
  window.quickInspectionUnits = units;
  unitSearch.value = '';
  unitSelect.value = '';
  document.getElementById('quickInspectionUnitSuggestions').innerHTML = '';
  showAppModal('quickInspectionModal');
}

function updateQuickInspectionTypeOptions(unit) {
  const select = document.getElementById('quickInspectionType');
  if (!select) return;
  [...select.options].forEach(option => {
    if (!option.value) return;
    const type = INSP_INSPECTION_TYPES.find(t => String(t.id) === String(option.value));
    const applicable = !unit || !type || inspIsInspectionTypeApplicableForUnit(type, unit);
    option.disabled = !applicable;
    option.textContent = type ? `${type.num}. ${type.name}${applicable ? '' : ' (not applicable)'}` : option.textContent;
  });
  if (select.selectedOptions[0]?.disabled) select.value = '';
}

function filterQuickInspectionUnits() {
  const input = document.getElementById('quickInspectionUnitSearch');
  const hidden = document.getElementById('quickInspectionUnit');
  const list = document.getElementById('quickInspectionUnitSuggestions');
  if (!input || !hidden || !list) return;
  const term = String(input.value || '').trim().toLowerCase();
  hidden.value = '';
  const matches = (window.quickInspectionUnits || [])
    .filter(u => !term || String(u.apt).toLowerCase().startsWith(term)).slice(0, 15);
  list.innerHTML = matches.length
    ? matches.map(u => `<div class="suggestion-item" role="option" onclick="selectQuickInspectionUnit('${String(u.apt).replace(/'/g, "\\'")}')"><strong>${u.apt}</strong><span>${u.building} · ${u.floor}</span></div>`).join('')
    : '<div class="suggestion-item" style="color:#999;cursor:default;">No matches found</div>';
  list.style.display = 'block';
  const selected = (window.quickInspectionUnits || []).find(u => String(u.apt).toLowerCase() === term);
  updateQuickInspectionTypeOptions(selected || null);
}

function selectQuickInspectionUnit(apt) {
  const input = document.getElementById('quickInspectionUnitSearch');
  const hidden = document.getElementById('quickInspectionUnit');
  const list = document.getElementById('quickInspectionUnitSuggestions');
  if (!input || !hidden) return;
  input.value = apt;
  hidden.value = apt;
  if (list) list.innerHTML = '';
  const selected = (window.quickInspectionUnits || []).find(u => String(u.apt) === String(apt));
  updateQuickInspectionTypeOptions(selected || null);
}

function closeQuickInspectionModal() { animateModalClose('quickInspectionModal'); }

function startQuickInspection(event) {
  event.preventDefault();
  const apt = document.getElementById('quickInspectionUnit')?.value || document.getElementById('quickInspectionUnitSearch')?.value.trim();
  const liveUnit = findInspectionEntity(apt);
  inspCurrentUnit = liveUnit || INSP_DEMO_UNITS.find(u => String(u.apt) === String(apt));
  if (!inspCurrentUnit) {
    filterQuickInspectionUnits();
    inspShowToast('Select a unit from the search results.', 'error');
    return;
  }
  window.inspLastSelectedUnit = inspCurrentUnit;
  window.inspReturnAfterInspection = 'inspection-type-list';
  animateModalClose('quickInspectionModal', () => {
    const selectedUnit = inspCurrentUnit;
    const tab = document.querySelector('.tab-main[onclick*="inspections"]');
    if (tab) switchMainTab('inspections', tab);
    inspShowTab('new');
    // Reuse the same unit-specific inspection cards shown by New Inspection.
    inspCurrentUnit = selectedUnit;
    window.inspLastSelectedUnit = selectedUnit;
    inspGoStep(2);
    inspRenderTypeGrid();
  });
}

function inspShowTab(name) {
  if (name !== 'new' && document.querySelector('.insp-summary-popup')) {
    // Remove a stale summary overlay immediately so it cannot swallow the
    // first History/Punch click. The destination tab can render in the same
    // event instead of requiring repeated clicks.
    inspResetInspectionViewState();
  }
  // A direct click on History/Punch List must show the complete list. Keep a
  // unit filter only when returning from a unit-specific summary/view.
  if (name === 'history' || name === 'punchlist' || name === 'report') {
    const preserveUnitFilter = window.inspPreserveUnitFilter === name;
    if (!preserveUnitFilter && (name === 'history' || name === 'punchlist')) window.inspHistoryUnitFilter = '';
    if (preserveUnitFilter) window.inspPreserveUnitFilter = '';
    if (!LOCAL_PROJECT_MODE && window.location.protocol !== 'file:' && !inspRemoteReady) {
      const pendingList = document.getElementById(name === 'history' ? 'insp-history-list' : name === 'punchlist' ? 'insp-punchlist-body' : 'insp-tab-report');
      if (pendingList) {
        const target = name === 'report' ? pendingList.querySelector('[data-report-body]') : pendingList;
        if (target) target.innerHTML = '<div class="insp-empty">Loading inspection data...</div>';
      }
      inspLoadRemoteModuleDataOnce().then(() => {
        if (name === 'history') inspLoadHistory();
        else if (name === 'punchlist') inspLoadPunchList();
        else inspLoadReport();
      }).catch(error => console.warn('Inspection data load failed:', error));
    }
  }
  if (name !== 'new' && document.getElementById('inspectionsTab')?.style.display === 'none') {
    const inspectionsButton = document.querySelector('.tab-main[onclick*="inspections"]');
    switchMainTab('inspections', inspectionsButton);
  }
  if (name !== 'new') {
    const detailsModal = document.getElementById('detailsModal');
    if (detailsModal?.classList.contains('show')) {
      detailsModal.classList.remove('show');
      detailsModal.style.display = 'none';
      detailsModal.setAttribute('aria-hidden', 'true');
    }
    const inspectionRoot = document.getElementById('inspectionsTab');
    if (inspectionRoot) {
      inspectionRoot.style.position = 'relative';
      inspectionRoot.style.zIndex = '10001';
    }
  }
  if (name !== 'new') {
    ['insp-step-search','insp-step-types','insp-step-checklist','insp-step-summary'].forEach(id => {
      const step = document.getElementById(id);
      if (step) { step.classList.add('hidden'); step.style.display = 'none'; }
    });
  }
  ['new','history','punchlist','report'].forEach(t => {
    const el = document.getElementById(`insp-tab-${t}`);
    if (el) { el.classList.add('hidden'); el.style.display = 'none'; }
  });
  // Mark active tab button (the div.insp-tab elements)
  document.querySelectorAll('#inspectionsTab .insp-tab').forEach(btn => {
    btn.classList.remove('active');
    // Match by onclick attribute text
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${name}'`)) {
      btn.classList.add('active');
    }
  });
  const activeTab = document.getElementById(`insp-tab-${name}`);
  if (activeTab) {
    activeTab.classList.remove('hidden');
    activeTab.style.display = 'block';
    if (name === 'new') {
      // New Inspection always starts from a clean, reusable unit search.
      inspGoStep(1);
    }
    if (name === 'history' || name === 'punchlist') setTimeout(() => activeTab.scrollIntoView({ behavior:'smooth', block:'start' }), 0);
  }
  if (activeTab && name !== 'new' && name !== 'report') {
    const header = activeTab.querySelector('.insp-card-header');
    if (header && !header.querySelector('.insp-view-controls')) {
      const controls = document.createElement('div');
      controls.className = 'insp-view-controls';
      controls.style.cssText = 'display:flex;gap:6px;margin-left:auto';
      controls.innerHTML = '<button title="Return" aria-label="Return" class="insp-btn insp-btn-sm insp-btn-outline insp-icon-nav" onclick="inspShowTab(\'new\');inspGoStep(1)">↩</button><button title="Close" aria-label="Close" class="insp-btn insp-btn-sm insp-btn-outline insp-icon-nav" onclick="switchMainTab(\'dashboard\',document.querySelector(\'.tab-main[onclick*=dashboard]\'))">×</button>';
      header.appendChild(controls);
    }
  }
  if (name === 'history') inspLoadHistory();
  if (name === 'punchlist') inspLoadPunchList();
  if (name === 'report') inspLoadReport();
  translatePageText(localStorage.getItem('cfg_language') || 'en');
}

// STEP NAVIGATION
function inspGoStep(n) {
  ['insp-step-search','insp-step-types','insp-step-checklist','insp-step-summary'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.classList.add('hidden'); el.style.display = 'none'; }
  });

  if (n === 1) {
    const el = document.getElementById('insp-step-search');
    if (el) { el.classList.remove('hidden'); el.style.display = 'block'; }
  inspSetBreadcrumb([{label:'🔍 Search Unit', step:1}]);
    inspCurrentUnit = null; inspCurrentType = null;
    const countHint = document.getElementById('insp-unit-count-hint');
    if (countHint) { try { countHint.textContent = `${inspectionEntitySource().length} units available`; } catch (_) {} }
  } else if (n === 2) {
    const el = document.getElementById('insp-step-types');
    if (el) {
      el.style.display = 'block';
      el.classList.remove('hidden', 'insp-closing');
      el.removeAttribute('aria-hidden');
    }
    const staleRetake = document.getElementById('insp-retake-modal');
    if (staleRetake) { staleRetake.classList.remove('insp-closing'); staleRetake.style.display = 'none'; }
    inspRenderTypeGrid();
    inspSetBreadcrumb([
  {label:'🔍 Search Unit', step:1},
      {label:`📍 ${inspCurrentUnit.apt}`, step:2}
    ]);
  } else if (n === 3) {
    const el = document.getElementById('insp-step-checklist');
    if (el) {
      el.style.display = 'block';
      el.classList.remove('hidden', 'insp-closing');
      el.removeAttribute('aria-hidden');
    }
    inspRenderChecklist();
    inspSetBreadcrumb([
  {label:'🔍 Search Unit', step:1},
      {label:`📍 ${inspCurrentUnit.apt}`, step:2},
      {label:`📋 ${inspCurrentType.name}`, step:3}
    ]);
  } else if (n === 4) {
    const el = document.getElementById('insp-step-summary');
    if (el) { el.classList.remove('hidden'); el.style.display = 'block'; }
    inspSetBreadcrumb([
  {label:'🔍 Search Unit', step:1},
      {label:`📍 ${inspCurrentUnit.apt}`, step:2},
  {label:`✅ Summary`, step:4}
    ]);
  }
  translatePageText(localStorage.getItem('cfg_language') || 'en');
}

function inspSetBreadcrumb(items) {
  const bc = document.getElementById('insp-breadcrumb');
  if (!bc) return;
  bc.innerHTML = items.map((item, i) =>
    `${i > 0 ? '<span class="insp-bc-sep">›</span>' : ''}
     <span class="insp-bc-item ${i === items.length-1 ? 'active' : ''}" onclick="inspGoStep(${item.step})">${item.label}</span>`
  ).join('');
}

// SEARCH
function inspSearchUnits(q) {
  const hint = document.getElementById('insp-search-hint');
  const results = document.getElementById('insp-search-results');
  if (!hint || !results) return;
  const searchInput = document.getElementById('insp-unit-search');
  if (searchInput) searchInput.disabled = false;
  results.style.pointerEvents = 'auto';
  const countHint = document.getElementById('insp-unit-count-hint');
  if (countHint) { try { countHint.textContent = `${inspectionEntitySource().length} units available`; } catch (_) {} }

  if (!q || q.length < 1) {
    results.style.display = 'none';
    results.classList.add('hidden');
    hint.classList.remove('hidden');
    return;
  }

  const q2 = q.trim().toLowerCase();
  const sourceUnits = inspectionEntitySource().map(u => ({ ...u, apt: String(u.apt || u.unit_number || ''), building: String(u.building || ''), floor: String(u.floor || '') }));
  const numericQuery = /^\d+$/.test(q2);
  const filtered = sourceUnits.filter(u => numericQuery
    ? u.apt.toLowerCase().startsWith(q2)
    : u.apt.toLowerCase().includes(q2) || u.building.toLowerCase().includes(q2) || u.floor.toLowerCase().includes(q2)
  ).slice(0, 15);

  hint.classList.add('hidden');

  if (filtered.length === 0) {
    results.style.display = 'block';
    results.classList.remove('hidden');
    results.innerHTML = '<div class="insp-empty" style="padding:20px"><p>No units found</p></div>';
    return;
  }

  results.style.display = 'block';
  results.classList.remove('hidden');
  results.innerHTML = `<div class="insp-results-list">${
    filtered.map(u => `
      <div class="insp-result-item" data-insp-apt="${String(u.apt).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}" role="button" tabindex="0">
        <div>
          <div class="insp-result-unit">${u.apt}</div>
          <div class="insp-result-info">${u.building} · ${u.floor}</div>
        </div>
        <span class="insp-result-arrow">→</span>
      </div>
    `).join('')
  }</div>`;
  if (!results._inspSearchClickBound) {
    results._inspSearchClickBound = true;
    const selectResult = event => {
      const item = event.target.closest('.insp-result-item');
      if (!item || !results.contains(item)) return;
      const apt = item.dataset.inspApt;
      if (apt) inspSelectUnit(apt);
    };
    results.addEventListener('click', selectResult);
    results.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectResult(event); }
    });
  }
}

function inspSelectUnit(apt) {
  const liveUnit = findInspectionEntity(apt);
  inspCurrentUnit = liveUnit || INSP_DEMO_UNITS.find(u => u.apt === apt);
  if (!inspCurrentUnit) return;
  window.inspLastSelectedUnit = inspCurrentUnit;
  window.inspHistoryUnitFilter = String(apt);
  try { sessionStorage.setItem('inspActiveUnit', JSON.stringify(inspCurrentUnit)); } catch (_) {}
  window.inspReturnAfterInspection = 'unit-search';
  inspGoStep(2);
  const el = document.getElementById('insp-types-unit-title');
  if (el) el.textContent = `Unit ${apt} — ${inspCurrentUnit.building}`;
}

// TYPE GRID
function inspGetApplicableTypes() {
  // Filter inspection types based on building config for current unit's building
  let cfg = null;
  if (window.location.protocol !== 'file:' && !LOCAL_PROJECT_MODE && inspRemoteReady) cfg = inspRemoteConfig;
  else try { cfg = JSON.parse(localStorage.getItem('insp_building_config') || 'null'); } catch(e) {}
  if (!cfg || !inspCurrentUnit) return INSP_INSPECTION_TYPES;
    const building = inspCurrentUnit.building;
    const scopeKey = normalizeFloorName(inspCurrentUnit.floor) === 'Underground' ? building + '::Underground' : building;
  return INSP_INSPECTION_TYPES.filter(t => {
    // If no config for this type, default to applicable (all buildings)
    if (!cfg[t.id]) return true;
    return cfg[t.id].includes(scopeKey) || (scopeKey.endsWith('::Underground') && !cfg[t.id].some(value => String(value).includes('::Underground')) && cfg[t.id].includes(building));
  });
}

    function inspIsInspectionTypeApplicableForBuilding(type, building) {
      let cfg = null;
      if (window.location.protocol !== 'file:' && !LOCAL_PROJECT_MODE && inspRemoteReady) cfg = inspRemoteConfig;
      else try { cfg = JSON.parse(localStorage.getItem('insp_building_config') || 'null'); } catch(e) {}
      if (!cfg || !building || !type) return true;
      if (!cfg[type.id]) return true;
      return cfg[type.id].includes(building);
    }

    function inspIsInspectionTypeApplicable(type) {
      return inspIsInspectionTypeApplicableForUnit(type, inspCurrentUnit);
    }

    function inspIsInspectionTypeApplicableForUnit(type, unit) {
      if (!type || !unit) return true;
      if (type.requiredSystem && !unit.systems?.[type.requiredSystem]) return false;
      let cfg = null;
      if (window.location.protocol !== 'file:' && !LOCAL_PROJECT_MODE && inspRemoteReady) cfg = inspRemoteConfig;
      else try { cfg = JSON.parse(localStorage.getItem('insp_building_config') || 'null'); } catch(e) {}
      if (!cfg || !cfg[type.id]) return true;
      const building = unit.building;
      const scopeKey = normalizeFloorName(unit.floor) === 'Underground' ? building + '::Underground' : building;
      const entries = cfg[type.id];
      return entries.includes(scopeKey) || (scopeKey.endsWith('::Underground') && !entries.some(value => String(value).includes('::Underground')) && entries.includes(building));
}

function inspRenderTypeGrid() {
  if (!inspCurrentUnit && window.inspLastSelectedUnit) inspCurrentUnit = window.inspLastSelectedUnit;
  if (!inspCurrentUnit) {
    try {
      const saved = JSON.parse(sessionStorage.getItem('inspActiveUnit') || 'null');
      if (saved) inspCurrentUnit = saved;
    } catch (_) {}
  }
  if (!inspCurrentUnit) return;
  window.inspLastSelectedUnit = inspCurrentUnit;
  try { sessionStorage.setItem('inspActiveUnit', JSON.stringify(inspCurrentUnit)); } catch (_) {}
  const inspections = inspGetInspections();
  const unitInspections = inspections.filter(r => r.apt === inspCurrentUnit.apt);
  // Keep every checklist visible. Project Setup only controls whether it is enabled.
  const applicableTypes = INSP_INSPECTION_TYPES;

  const grid = document.getElementById('insp-type-grid');
  if (!grid) return;
  if (applicableTypes.length === 0) {
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:24px;color:#6B7280;font-size:14px;">⚠️ No inspection types are configured for this building.<br>Check Project Setup → Inspection Types by Area.</div>';
    return;
  }
  grid.innerHTML = applicableTypes.map(t => {
    const isApplicable = inspIsInspectionTypeApplicable(t);
    const prev = unitInspections.filter(r => r.typeId === t.id);
    const lastInsp = prev[prev.length - 1];
    const draftKey = `inspection_draft_${inspCurrentUnit.apt}_${t.id}`;
    const hasDraft = (LOCAL_PROJECT_MODE || window.location.protocol === 'file:')
      ? Boolean(localStorage.getItem(draftKey))
      : inspRemoteDrafts.has(draftKey);
    let badge = '';
    let cls = isApplicable ? '' : 'insp-type-disabled';
    if (hasDraft && !lastInsp) {
      badge = '<div class="insp-badge" style="margin-top:6px;color:#1d4ed8;background:#dbeafe">📝 Draft saved</div>';
      cls += ' has-draft';
    } else if (lastInsp) {
      if (lastInsp.failedCount > 0) {
  badge = `<div class="insp-badge insp-badge-fail" style="margin-top:6px">⚠️ ${lastInsp.failedCount} failure(s)</div>`;
        cls += ' has-fail';
      } else {
  badge = `<div class="insp-badge insp-badge-pass" style="margin-top:6px">✅ Completed</div>`;
        cls += ' has-inspection';
      }
    }
    if (!isApplicable) badge = '<div class="insp-badge insp-badge-na" style="margin-top:6px">Not applicable</div>';
    const resetButton = `<button type="button" class="insp-card-reset" data-reset-inspection-card="${t.id}" title="Reset inspection" aria-label="Reset inspection">↻</button>`;
    return `
      <a href="#inspection-${t.id}" class="insp-type-btn ${cls}" data-insp-type-id="${t.id}" ${isApplicable ? '' : 'aria-disabled="true" tabindex="-1"'} style="position:relative">
        ${resetButton}
  <div class="insp-type-num">Inspection ${t.num}</div>
        <div class="insp-type-name">${t.name}</div>
        <div class="insp-type-count">${t.items.length} items</div>
        ${badge}
      </a>
    `;
  }).join('');
  // The grid element survives card rebuilds; delegated click handling keeps
  // every card active after returning from an inspection.
  if (!grid._inspTypeClickBound) {
    grid._inspTypeClickBound = true;
    grid.addEventListener('click', event => {
      const resetButton = event.target.closest('[data-reset-inspection-card]');
      if (resetButton && grid.contains(resetButton)) {
        event.preventDefault();
        event.stopPropagation();
        inspResetInspectionCard(resetButton.dataset.resetInspectionCard);
        return;
      }
      const card = event.target.closest('.insp-type-btn');
      if (!card || !grid.contains(card)) return;
      if (card.getAttribute('aria-disabled') === 'true') return;
      const typeId = card.dataset.inspTypeId;
      if (!typeId) return;
      event.preventDefault();
      inspSelectType(typeId);
    });
  }
  grid.querySelectorAll('.insp-type-btn').forEach(card => {
    card.style.pointerEvents = 'auto';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
  });
}

function inspSelectType(typeId) {
  inspCurrentType = INSP_INSPECTION_TYPES.find(t => String(t.id) === String(typeId));
  if (!inspCurrentType || !inspCurrentUnit) return;
  window.inspReturnAfterInspection = 'inspection-type-list';
  const draftKey = `inspection_draft_${inspCurrentUnit.apt}_${typeId}`;
  // Check if prior inspection exists for this unit + type
  const prior = inspGetLastInspection(inspCurrentUnit.apt, typeId);
  inspPriorItemsForReinspection = prior ? (prior.items || []).map(item => ({ status: item.status, photos: item.photos || [] })) : null;
  if (prior) {
    // Always show the retake choice when an inspection already exists.
    // A saved draft is still available to Resume, but must not suppress this dialog.
    inspShowRetakeModal(prior, typeId);
  } else if (localStorage.getItem(draftKey)) {
    inspChecklistItems = inspCurrentType.items.map(() => ({ status: null, comment: '', photos: [] }));
    inspLoadDraft();
    inspGoStep(3);
  } else {
    inspChecklistItems = inspCurrentType.items.map(() => ({ status: null, comment: '', photos: [] }));
    inspLoadDraft();
    inspGoStep(3);
  }
}

function inspGetLastInspection(apt, typeId) {
  const all = inspGetInspections();
  // Get last inspection for this unit + type
  const matches = all.filter(r => r.apt === apt && r.typeId === typeId);
  return matches.length ? matches[matches.length - 1] : null;
}

function inspShowRetakeModal(prior, typeId) {
  // Show modal asking Retomar or Nueva
  let modal = document.getElementById('insp-retake-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'insp-retake-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:2147483001 !important;pointer-events:auto;isolation:isolate';
    modal.innerHTML = `
      <div style="background:#fff;border-radius:12px;padding:32px;max-width:420px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.2)">
  <h3 style="margin:0 0 8px;font-size:18px;color:#1f2937">Resume or start a new inspection?</h3>
  <p style="margin:0 0 20px;color:#6b7280;font-size:14px">A previous inspection exists from <span id="insp-retake-date"></span>. Would you like to resume with the previous answers or start from scratch?</p>
        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button onclick="inspRetakeChoice('nueva')" style="padding:10px 20px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer;font-size:14px">📋 Nueva</button>
          <button onclick="inspRetakeChoice('retomar')" style="padding:10px 20px;border:none;border-radius:8px;background:#0B5394;color:#fff;cursor:pointer;font-size:14px;font-weight:600">🔄 Retomar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  const retakeTitle = modal.querySelector('h3');
  const retakeText = modal.querySelector('p');
  if (retakeTitle) retakeTitle.textContent = 'Resume or start a new inspection?';
  if (retakeText) retakeText.innerHTML = 'A previous inspection exists from <span id="insp-retake-date"></span>. Would you like to resume with the previous answers or start over?';
  const retakeButtons = modal.querySelectorAll('button');
  if (retakeButtons[0]) retakeButtons[0].textContent = 'New';
  if (retakeButtons[1]) retakeButtons[1].textContent = 'Resume';
  if (!modal.querySelector('.retake-close')) {
    const close = document.createElement('button');
    close.className = 'retake-close'; close.textContent = '✕'; close.title = 'Close';
    close.style.cssText = 'position:absolute;top:10px;right:14px;border:0;background:transparent;font-size:20px;cursor:pointer;color:#64748b';
    close.setAttribute('onclick', "animateModalClose('insp-retake-modal', () => document.getElementById('insp-retake-modal').style.display='none')");
    const box = modal.firstElementChild; if (box) { box.style.position = 'relative'; box.appendChild(close); }
  }
  // Store prior items for retomar
  modal._priorItems = prior.items;
  modal._typeId = typeId;
  modal._draftKey = `inspection_draft_${inspCurrentUnit.apt}_${typeId}`;
  const dateEl = document.getElementById('insp-retake-date');
  if (dateEl) dateEl.textContent = prior.date ? new Date(prior.date).toLocaleDateString('es-PR') : 'fecha anterior';
  modal.style.display = 'flex';
}

function inspRetakeChoice(choice) {
  const modal = document.getElementById('insp-retake-modal');
  if (modal) { modal.classList.add('insp-closing'); setTimeout(() => { modal.style.display = 'none'; modal.classList.remove('insp-closing'); }, 480); }
  if (choice === 'retomar' && modal && modal._priorItems) {
    // Prefer the current saved draft; otherwise restore the last submitted inspection.
    if (modal._draftKey && localStorage.getItem(modal._draftKey)) {
      inspChecklistItems = inspCurrentType.items.map(() => ({ status: null, comment: '', photos: [] }));
      inspLoadDraft();
    } else {
      inspChecklistItems = inspCurrentType.items.map((item, i) => {
        const prev = modal._priorItems[i];
        return prev ? { status: prev.status, comment: prev.comment || '', photos: prev.photos || [] } : { status: null, comment: '', photos: [] };
      });
    }
  } else {
    // Start blank
    inspChecklistItems = inspCurrentType.items.map(() => ({ status: null, comment: '', photos: [] }));
  }
  inspGoStep(3);
  if (window.inspReturnAfterInspection === 'history') {
    setTimeout(() => {
      const closeButton = document.querySelector('#insp-step-checklist .insp-top-controls')?.querySelectorAll('button')[1];
      if (closeButton) closeButton.onclick = inspCloseInspectionView;
    }, 0);
  }
}

// CHECKLIST
function inspRenderChecklist() {
  inspApplyCurrentInspector();
  const checklistHeader = document.querySelector('#insp-step-checklist .insp-checklist-header');
  checklistHeader?.querySelectorAll('.insp-top-controls').forEach(el => el.remove());
  if (checklistHeader && !checklistHeader.querySelector('.insp-top-controls')) {
    const controls = document.createElement('div');
    controls.className = 'insp-top-controls';
    controls.style.cssText = 'display:flex;gap:6px;align-items:center;margin-left:auto;flex-shrink:0';
    controls.innerHTML = '<button type="button" title="Back" aria-label="Back" class="insp-btn insp-btn-outline insp-btn-sm insp-icon-nav" onclick="inspGoStep(2)">↩</button><button type="button" title="Close" aria-label="Close" class="insp-btn insp-btn-outline insp-btn-sm insp-icon-nav" onclick="switchMainTab(\'dashboard\',document.querySelector(\'.tab-main[onclick*=dashboard]\'))">×</button>';
    checklistHeader.appendChild(controls);
  }
  const checklistClose = checklistHeader?.querySelector('.insp-top-controls button:last-child');
  const checklistBack = checklistHeader?.querySelector('.insp-top-controls button:first-child');
  if (checklistBack) { checklistBack.textContent = '\u21a9'; checklistBack.title = 'Back'; checklistBack.setAttribute('aria-label', 'Back'); checklistBack.classList.add('insp-icon-nav'); }
  if (checklistClose) { checklistClose.textContent = '\u00d7'; checklistClose.title = 'Close'; checklistClose.setAttribute('aria-label', 'Close'); checklistClose.classList.add('insp-icon-nav'); }
  if (checklistClose) checklistClose.onclick = inspCloseInspectionView;
  inspUseSingleCloseControl();
  inspEnsureChecklistActions();
  document.querySelectorAll('#insp-step-checklist button[aria-label="Return"]').forEach(button => {
    button.onclick = inspReturnToTypeList;
  });
  const titleEl = document.getElementById('insp-checklist-title');
  const subEl = document.getElementById('insp-checklist-sub');
  const inspSel = document.getElementById('insp-inspector-select');

  const currentLang = localStorage.getItem('cfg_language') || 'en';
  if (titleEl) titleEl.textContent = `${inspCurrentType.num}. ${inspLocalizeChecklistText(inspCurrentType.name, currentLang)}`;
  if (subEl) subEl.textContent =
  `Unit ${inspCurrentUnit.apt} · ${inspCurrentUnit.building} · Inspector: ${inspSel ? inspSel.value : 'J. Rodriguez'}`;

  if (currentLang === 'es' && subEl) subEl.textContent = `Unidad ${inspCurrentUnit.apt} · ${inspCurrentUnit.building} · Inspector: ${inspSel ? inspSel.value : 'J. Rodriguez'}`;
  const tbody = document.getElementById('insp-checklist-body');
  if (!tbody) return;
  tbody.innerHTML = inspCurrentType.items.map((item, i) => `
    <tr id="insp-row-${i}" class="">
      <td>
        <div class="insp-item-desc">
          <span class="insp-item-num">${String(i+1).padStart(2,'0')}</span>
          <span class="insp-item-text">${inspLocalizeChecklistText(item, currentLang)}</span>
          ${inspChecklistItems[i]?.photos?.length ? `<button type="button" class="insp-photo-icon" title="View photos" onclick="inspOpenChecklistItemPhotos(${i})">📷 ${inspChecklistItems[i].photos.length}</button>` : ''}
        </div>
      </td>
      <td data-label="PASS">
        <div class="insp-btn-group">
          <button class="insp-btn-status insp-btn-pass" id="insp-btn-pass-${i}" onclick="inspSetStatus(${i},'PASS')">✓ PASS</button>
        </div>
      </td>
      <td data-label="FAIL">
        <div class="insp-btn-group">
          <button class="insp-btn-status insp-btn-fail" id="insp-btn-fail-${i}" onclick="inspSetStatus(${i},'FAIL')">✗ FAIL</button>
        </div>
      </td>
      <td data-label="N/A">
        <div class="insp-btn-group">
          <button class="insp-btn-status insp-btn-na" id="insp-btn-na-${i}" onclick="inspSetStatus(${i},'NA')">— N/A</button>
        </div>
      </td>
    </tr>
  `).join('');

  inspChecklistItems.forEach((item, i) => {
    if (item && item.status) inspUpdateRowUI(i);
  });
  inspUpdateProgress();
}

// Translate dynamically rendered checklist content as well as static page text.
function inspLocalizeChecklistText(value, lang) {
  if (lang !== 'es' || !value) return value;
  const replacements = [
    // Complete phrases come first so the result reads naturally in Spanish.
    ['Approved electrical plans available on site','Planos eléctricos aprobados disponibles en el sitio'],
    ['Conduit type and size correct per specifications','Tipo y tamaño del conduit correctos según las especificaciones'],
    ['NM cable correct gauge per circuit','Calibre correcto del cable NM para cada circuito'],
    ['Conduit installed without excessive bends','Conduit instalado sin curvas excesivas'],
    ['Electrical boxes at correct height per code','Cajas eléctricas instaladas a la altura correcta según el código'],
    ['Boxes level and flush with finished wall surface','Cajas niveladas y al ras de la superficie terminada de la pared'],
    ['Box fill calculation not exceeded','La capacidad de llenado de la caja no excede el límite permitido'],
    ['Circuit count matches approved plans','La cantidad de circuitos coincide con los planos aprobados'],
    ['Power circuits separated from data/communications circuits','Circuitos de energía separados de los circuitos de datos y comunicaciones'],
    ['Straps/supports every 10 ft or less and within 3 ft of each box (conduit)','Abrazaderas y soportes cada 10 pies o menos, y a menos de 3 pies de cada caja (conduit)'],
    ['Staples within 12" of each box and every 4.5 ft along run (free wire - NEC 334.30)','Grapas a menos de 12 pulgadas de cada caja y cada 4.5 pies a lo largo del recorrido (cable libre, NEC 334.30)'],
    ['Cable/conduit protected at penetrations through framing (nail plates where required - NEC 300.4)','Cable y conduit protegidos en las penetraciones de la estructura (placas protectoras donde sean requeridas, NEC 300.4)'],
    ['No mechanical damage to conduit or cable insulation','Sin daños mecánicos en el conduit ni en el aislamiento del cable'],
    ['Sleeves/penetrations prepared for fire stop','Manguitos y penetraciones preparados para el sellado contra incendios'],
    ['Pull boxes installed where required by code','Cajas de halado instaladas donde lo exige el código'],
    ['AFCI/GFCI circuits roughed-in per NEC and Florida Building Code','Circuitos AFCI/GFCI preinstalados conforme al NEC y al Código de Construcción de Florida'],
    ['Approved overhead/ceiling plans available on site','Planos aprobados de techo disponibles en el sitio'],
    ['Minimum 6" separation between electrical and plumbing/mechanical piping','Separación mínima de 6 pulgadas entre las tuberías eléctricas y las de plomería o mecánica'],
    ['Conduit type correct for location and exposure','Tipo de conduit adecuado para la ubicación y el nivel de exposición'],
    ['NM cable correct type for location - NM-B permitted only in dry areas (residential)','Tipo de cable NM adecuado para la ubicación; el NM-B solo está permitido en áreas secas (residencial)'],
    ['Conduit secured with proper hangers every 10 ft','Conduit asegurado con soportes adecuados cada 10 pies'],
    ['NM cable supported every 4.5 ft in attic/ceiling space (NEC 334.30)','Cable NM sostenido cada 4.5 pies en el ático o espacio del techo (NEC 334.30)'],
    ['Installation height clear of HVAC, mechanical, and structural conflicts','Altura de instalación libre de interferencias con HVAC, elementos mecánicos y estructura'],
    ['Communications/data conduit/cable separated from power','Conduit y cable de comunicaciones o datos separados de la energía'],
    ['No interference with structural members, beams, or ductwork','Sin interferencias con elementos estructurales, vigas ni conductos'],
    ['Rough-in correct for fixtures per plans (position and type)','Preinstalación correcta para los accesorios según los planos (posición y tipo)'],
    ['Recessed fixtures rated IC where insulation is present','Accesorios empotrados con clasificación IC donde haya aislamiento'],
    ['Junction boxes accessible - not buried or behind finished surfaces','Cajas de conexión accesibles; no enterradas ni ocultas detrás de superficies terminadas'],
    ['Circuit identification at all junction boxes','Identificación de circuitos en todas las cajas de conexión'],
    ['All penetrations through fire-rated assemblies identified and documented','Todas las penetraciones en conjuntos resistentes al fuego están identificadas y documentadas'],
    ['Fire stop material is UL Listed and correct for penetration type and assembly rating','El material cortafuego está listado por UL y es adecuado para el tipo de penetración y la clasificación del conjunto'],
    ['No gaps or voids around conduit or cable at penetrations','No hay espacios ni vacíos alrededor del conduit o cable en las penetraciones'],
    ['Devices installed per plans','Dispositivos instalados según los planos'],
    ['Smoke detectors in all required rooms and corridors','Detectores de humo en todas las habitaciones y pasillos requeridos'],
    ['Sealant fully applied in fire-rated walls','Sellador aplicado completamente en las paredes resistentes al fuego'],
    ['Sealant fully applied in floor/ceiling assemblies between floors','Sellador aplicado completamente en los conjuntos de piso y techo entre niveles'],
    ['Sealant thickness per manufacturer specifications','Espesor del sellador conforme a las especificaciones del fabricante'],
    ['Metal conduit sealed internally at penetrations','Conduit metálico sellado internamente en las penetraciones'],
    ['Fire blocking installed in stud cavities over 10 ft vertical','Bloqueo contra incendios instalado en cavidades de montantes con más de 10 pies de altura'],
    ['Fire blocking at ceiling/floor junctions, soffits, and concealed spaces','Bloqueo contra incendios en uniones de techo y piso, plafones y espacios ocultos'],
    ['Fire stop labels installed at each sealed penetration','Etiquetas de sellado contra incendios instaladas en cada penetración sellada'],
    ['Area clean and accessible for fire marshal inspection','Área limpia y accesible para la inspección del jefe de bomberos'],
    ['Approved electrical room plans and single-line diagram available on site','Planos aprobados del cuarto eléctrico y diagrama unifilar disponibles en el sitio'],
    ['Dedicated electrical room - no plumbing, mechanical, or storage permitted','Cuarto eléctrico exclusivo; no se permite plomería, equipo mecánico ni almacenamiento'],
    ['Main breaker/disconnect correct size and type per plans','Interruptor principal o desconectador del tamaño y tipo correctos según los planos'],
    ['Conductors correct gauge, insulation type, and color coding for voltage system','Conductores con calibre, aislamiento y codificación de colores correctos para el sistema de voltaje'],
    ['Neutral and ground buses properly separated and bonded per NEC 250','Barras de neutro y tierra correctamente separadas y conectadas según NEC 250'],
    ['Room dimensions meet minimum working clearance','Las dimensiones del cuarto cumplen con el espacio mínimo de trabajo'],
    ['Switchboard/MDP installed level and plumb','Tablero eléctrico o MDP instalado nivelado y aplomado'],
    ['Bus bar ratings match design','La capacidad de las barras coincide con el diseño'],
    ['All feeder conduits entering panel sealed','Todos los conduits alimentadores que entran al panel están sellados'],
    ['All conductors terminated correctly','Todos los conductores están terminados correctamente'],
    ['Grounding electrode system complete and connected','Sistema de electrodos de puesta a tierra completo y conectado'],
    ['Equipment grounding conductors correct size and connected','Conductores de puesta a tierra del equipo con el tamaño correcto y conectados'],
    ['No open slots - all knockouts and openings sealed','No hay espacios abiertos; todos los troqueles y aberturas están sellados'],
    ['Metering equipment installed and functional','Equipo de medición instalado y funcionando'],
    ['Arc flash and shock hazard labels installed','Etiquetas de riesgo de arco eléctrico y descarga instaladas'],
    ['Electrical room door opens outward and is lockable','La puerta del cuarto eléctrico abre hacia afuera y puede cerrarse con llave'],
    ['Adequate lighting inside electrical room','Iluminación adecuada dentro del cuarto eléctrico'],
    ['Fire extinguisher accessible outside electrical room','Extintor accesible fuera del cuarto eléctrico'],
    ['Distribution panel/sub-panel installed and level','Panel de distribución o subpanel instalado y nivelado'],
    ['Panel secured to adequate structure','Panel asegurado a una estructura adecuada'],
    ['Minimum 36" working clearance in front of panel','Espacio de trabajo mínimo de 36 pulgadas frente al panel'],
    ['Breakers installed per panel schedule','Interruptores instalados según el cuadro del panel'],
    ['Conductors identified/labeled at both ends','Conductores identificados y etiquetados en ambos extremos'],
    ['Ground rods installed','Varillas de tierra instaladas'],
    ['Panel and system bonding completed per NEC 250','Conexión equipotencial del panel y del sistema completada según NEC 250'],
    ['No loose or unfinished conductors inside panel','No hay conductores sueltos ni sin terminar dentro del panel'],
    ['Circuit directory complete and legible','Directorio de circuitos completo y legible'],
    ['Tamper-resistant receptacles throughout dwelling units','Tomacorrientes resistentes a manipulación instalados en todas las unidades'],
    ['AHJ-approved fire alarm plans available on site','Planos de alarma contra incendios aprobados por la autoridad competente disponibles en el sitio'],
    ['FA control panel installed in approved location','Panel de control de alarma contra incendios instalado en una ubicación aprobada'],
    ['Smoke alarms in each sleeping room and outside each sleeping area','Alarmas de humo en cada dormitorio y fuera de cada área de descanso'],
    ['Heat detectors in kitchens, garages, and areas where smoke detectors are not permitted','Detectores de calor en cocinas, garajes y áreas donde no se permiten detectores de humo'],
    ['Carbon monoxide alarms installed where required','Alarmas de monóxido de carbono instaladas donde sean requeridas'],
    ['Pull stations at each required exit','Estaciones manuales de alarma en cada salida requerida'],
    ['Strobes/horns/speakers at correct locations and heights','Luces estroboscópicas, sirenas y altavoces en las ubicaciones y alturas correctas'],
    ['All alarms interconnected - when one sounds, all sound','Todas las alarmas interconectadas; cuando suena una, suenan todas'],
    ['Hardwired with battery backup - no battery-only units','Conectado permanentemente con respaldo de batería; no se permiten unidades solo con batería'],
    ['Supervised wiring - Class A or B per design','Cableado supervisado, Clase A o B según el diseño'],
    ['System programmed with correct zoning','Sistema programado con la zonificación correcta'],
    ['Real smoke test completed on representative sample of detectors','Prueba real de humo completada en una muestra representativa de detectores'],
    ['Sound test: dB level verified in sleeping areas','Prueba de sonido: nivel de decibeles verificado en las áreas de descanso'],
    ['CO alarm test completed and functional','Prueba de alarma de CO completada y funcionamiento verificado'],
    ['Battery backup test: minimum 24hr standby + 5 min alarm','Prueba de respaldo de batería: mínimo de 24 horas en espera y 5 minutos en alarma'],
    ['Test certificate signed by licensed FA contractor','Certificado de prueba firmado por un contratista autorizado de alarmas contra incendios'],
    ['Programming record and access code delivered to owner','Registro de programación y código de acceso entregados al propietario'],
    ['All receptacles correct voltage, polarity, and grounding verified','Voltaje, polaridad y puesta a tierra correctos verificados en todos los tomacorrientes'],
    ['Smoke alarms interconnected and functional - all sound simultaneously','Alarmas de humo interconectadas y funcionales; todas suenan simultáneamente'],
    ['CO alarms functional where required','Alarmas de CO funcionales donde sean requeridas'],
    ['Fire alarm system fully operational - final test witnessed by AHJ','Sistema de alarma contra incendios completamente operativo; prueba final presenciada por la autoridad competente'],
    ['Panel no alarms, trips, or disconnected breakers','Panel sin alarmas, disparos ni interruptores desconectados'],
    ['Arc flash labels in place on electrical room/switchboard','Etiquetas de arco eléctrico instaladas en el cuarto eléctrico o tablero'],
    ['No exposed conduit or cable where not permitted by code','No hay conduit ni cables expuestos donde el código no lo permite'],
    ['Attic and crawl space wiring properly supported and protected','Cableado del ático y del espacio de acceso correctamente sostenido y protegido'],
    ['HVAC disconnect correct size and properly labeled','Desconectador de HVAC del tamaño correcto y debidamente etiquetado'],
    ['Distribution panel installed and level','Panel de distribución instalado y nivelado'],
    ['Panel size and type per plans','Tamaño y tipo de panel según los planos'],
    ['Correct conductors: gauge, insulation type, and color coding','Conductores correctos: calibre, tipo de aislamiento y codificación de colores'],
    ['Neutrals and grounds properly separated','Neutros y tierras correctamente separados'],
    ['Ground rods installed - minimum 2 rods 6 ft apart','Varillas de tierra instaladas; mínimo 2 varillas separadas 6 pies'],
    ['Breaker blanks installed - no open slots','Tapas ciegas de interruptores instaladas; no hay espacios abiertos'],
    ['AFCI breakers installed where required','Interruptores AFCI instalados donde sean requeridos'],
    ['GFCI breakers/receptacles at all required locations','Interruptores o tomacorrientes GFCI en todas las ubicaciones requeridas'],
    ['Connection to emergency circuit or internal battery verified','Conexión al circuito de emergencia o batería interna verificada'],
    ['Minimum 1 ft-candle illumination at floor level on entire egress path','Iluminación mínima de 1 pie-bujía a nivel del piso en toda la ruta de evacuación'],
    ['Circuit identification at all junction boxes','Identificación de circuitos en todas las cajas de conexión'],
    ['Smoke detector rough-in locations per Florida Residential Code R314','Ubicaciones de preinstalación de detectores de humo según el Código Residencial de Florida R314'],
    ['Access panels located per plans','Paneles de acceso ubicados según los planos'],
    ['Junction boxes accessible - not buried or behind finished surfaces','Cajas de conexión accesibles; no enterradas ni detrás de superficies terminadas'],
    ['All feeder conduits entering panel sealed','Todos los conduits alimentadores que entran al panel están sellados'],
    ['Conductors correct gauge, insulation type, and color coding for voltage system','Conductores con calibre, aislamiento y codificación de colores correctos para el sistema de voltaje'],
    ['All conductors terminated correctly - proper torque values per manufacturer specs','Todos los conductores terminados correctamente, con el torque indicado por el fabricante'],
    ['Surge protection device installed if required per plans','Dispositivo de protección contra sobretensiones instalado cuando lo exigen los planos'],
    ['All breakers/fuses installed per panel schedule','Todos los interruptores y fusibles instalados según el cuadro del panel'],
    ['Bus bracing rated for available fault current','Refuerzo de barras con clasificación para la corriente de falla disponible'],
    ['Panel directory/circuit schedule complete, legible, and correct','Directorio del panel y cuadro de circuitos completos, legibles y correctos'],
    ['As-built single-line diagram posted inside room or in protective sleeve','Diagrama unifilar conforme a obra colocado dentro del cuarto o en una funda protectora'],
    ['Panel size and type per plans','Tamaño y tipo de panel según los planos'],
    ['Panel secured to adequate structure (not drywall only)','Panel asegurado a una estructura adecuada, no únicamente al drywall'],
    ['Breakers installed per panel schedule (type, amperes, position)','Interruptores instalados según el cuadro del panel (tipo, amperaje y posición)'],
    ['Conductors identified/labeled at both ends','Conductores identificados y etiquetados en ambos extremos'],
    ['Neutrals and grounds properly separated (in sub-panels)','Neutros y tierras correctamente separados en los subpaneles'],
    ['Grounding electrode conductor installed and connected','Conductor del electrodo de puesta a tierra instalado y conectado'],
    ['Circuit directory complete and legible','Directorio de circuitos completo y legible'],
    ['AFCI breakers installed where required by NEC','Interruptores AFCI instalados donde los exige el NEC'],
    ['GFCI breakers/receptacles at all required locations','Interruptores o tomacorrientes GFCI en todas las ubicaciones requeridas'],
    ['Written authorization to energize received','Autorización escrita para energizar recibida'],
    ['Continuity test completed before energizing','Prueba de continuidad completada antes de energizar'],
    ['Correct polarity at all receptacles','Polaridad correcta en todos los tomacorrientes'],
    ['No open grounds at any receptacle','No hay tierras abiertas en ningún tomacorriente'],
    ['GFCI tested at all required locations - trip and reset functional','GFCI probado en todas las ubicaciones requeridas; disparo y restablecimiento funcionales'],
    ['AFCI tested with test button - all required circuits','AFCI probado con el botón de prueba en todos los circuitos requeridos'],
    ['Breakers operating correctly (trip and reset)','Interruptores funcionando correctamente (disparo y restablecimiento)'],
    ['Load current measured and within circuit capacity','Corriente de carga medida y dentro de la capacidad del circuito'],
    ['Available fault current verified does not exceed equipment AIC rating','Corriente de falla disponible verificada; no excede la clasificación AIC del equipo'],
    ['Sound test: dB level verified in sleeping areas','Prueba de sonido: nivel de decibeles verificado en las áreas de descanso'],
    ['CO alarm test completed and functional (where required)','Prueba de alarma de CO completada y funcional donde sea requerida'],
    ['Battery backup test: minimum 24hr standby + 5 min alarm','Prueba de respaldo de batería: mínimo de 24 horas en espera y 5 minutos en alarma'],
    ['Test certificate signed by licensed FA contractor','Certificado de prueba firmado por un contratista autorizado de alarmas contra incendios'],
    ['Programming record and access code delivered to owner','Registro de programación y código de acceso entregados al propietario'],
    ['All light fixtures functioning correctly','Todos los artefactos de iluminación funcionan correctamente'],
    ['Dimmers functioning without flickering or interference','Atenuadores funcionando sin parpadeos ni interferencias'],
    ['GFCI at all required locations tested - trip and reset functional','GFCI probado en todas las ubicaciones requeridas; disparo y restablecimiento funcionales'],
    ['AFCI at all required circuits tested with test button','AFCI probado con el botón de prueba en todos los circuitos requeridos'],
    ['Emergency lights and exit signs operational','Luces de emergencia y señales de salida operativas'],
    ['CO alarms functional where required','Alarmas de CO funcionales donde sean requeridas'],
    ['Fire alarm system fully operational','Sistema de alarma contra incendios completamente operativo'],
    ['Work area clean - no materials, tools, or debris','Área de trabajo limpia, sin materiales, herramientas ni escombros'],
    ['Conduit type and size correct per specifications (EMT, RMC, PVC as required)','Tipo y tamaño del conduit correctos según las especificaciones (EMT, RMC o PVC según corresponda)'],
    ['NM cable correct gauge per circuit (residential free wire where applicable)','Calibre correcto del cable NM para cada circuito (cableado residencial libre cuando corresponda)'],
    ['Conduit installed without excessive bends (max 360 degrees total between boxes)','Conduit instalado sin curvas excesivas (máximo total de 360 grados entre cajas)'],
    ['Electrical boxes at correct height per code (receptacles, switches, panels)','Cajas eléctricas instaladas a la altura correcta según el código (tomacorrientes, interruptores y paneles)'],
    ['Box fill calculation not exceeded (NEC 314.16)','La capacidad de llenado de la caja no excede el límite permitido (NEC 314.16)'],
    ['Conduit type correct for location and exposure (EMT, RMC, MC cable as applicable)','Tipo de conduit adecuado para la ubicación y exposición (EMT, RMC o cable MC según corresponda)'],
    ['Access panels located per plans - minimum 22"x30" per FBC','Paneles de acceso ubicados según los planos, con un mínimo de 22 por 30 pulgadas según el FBC'],
    ['NM cable protected with guard strips within 6 ft of attic access opening (NEC 334.23)','Cable NM protegido con placas de resguardo a menos de 6 pies de la abertura de acceso al ático (NEC 334.23)'],
    ['Smoke detector rough-in locations per Florida Residential Code R314 (residential)','Ubicaciones de preinstalación de detectores de humo según el Código Residencial de Florida R314 (residencial)'],
    ['Metal conduit sealed internally at penetrations (intumescent plug if required)','Conduit metálico sellado internamente en las penetraciones (con tapón intumescente cuando sea requerido)'],
    ['Fire blocking installed in stud cavities over 10 ft vertical (FBC R302.11)','Bloqueo contra incendios instalado en cavidades de montantes de más de 10 pies verticales (FBC R302.11)'],
    ['Photos taken of each penetration before covering','Fotografías tomadas de cada penetración antes de cubrirla'],
    ['UL system number documented and visible on site','Número del sistema UL documentado y visible en el sitio'],
    ['Fire stop inspector signed approval (if required by AHJ)','Aprobación firmada por el inspector de sellado contra incendios cuando la autoridad competente lo requiera'],
    ['Switchboard/MDP installed level and plumb, anchored to floor/wall per seismic requirements','Tablero eléctrico o MDP instalado nivelado y aplomado, anclado al piso o pared según los requisitos sísmicos'],
    ['Bus bar ratings match design (amperes, voltage, interrupting capacity)','La capacidad de las barras coincide con el diseño (amperaje, voltaje y capacidad interruptiva)'],
    ['All feeder conduits entering panel sealed (fire stop and weatherproofing where applicable)','Todos los conduits alimentadores que entran al panel están sellados (sellado contra incendios e impermeabilización cuando corresponda)'],
    ['Grounding electrode system complete and connected (NEC 250.50)','Sistema de electrodos de puesta a tierra completo y conectado (NEC 250.50)'],
    ['Surge protection device (SPD) installed if required per plans (NEC 230.67)','Dispositivo de protección contra sobretensiones (SPD) instalado cuando lo exigen los planos (NEC 230.67)'],
    ['All breakers/fuses installed per panel schedule (type, amperes, position, labeling)','Todos los interruptores y fusibles instalados según el cuadro del panel (tipo, amperaje, posición y etiquetado)'],
    ['Bus bracing rated for available fault current (AIC rating verified)','Refuerzo de barras con clasificación para la corriente de falla disponible (clasificación AIC verificada)'],
    ['Metering equipment installed and functional (if applicable)','Equipo de medición instalado y funcionando cuando corresponda'],
    ['Arc flash and shock hazard labels installed (NFPA 70E)','Etiquetas de riesgo de arco eléctrico y descarga instaladas (NFPA 70E)'],
    ['Adequate lighting inside electrical room (minimum 10 ft-candles - NEC 110.26(D))','Iluminación adecuada dentro del cuarto eléctrico (mínimo 10 pies-bujía, NEC 110.26(D))'],
    ['Panel size and type per plans (amperes, number of circuits)','Tamaño y tipo de panel según los planos (amperaje y cantidad de circuitos)'],
    ['Minimum 36" working clearance in front of panel - clear and unobstructed (NEC 110.26)','Espacio de trabajo mínimo de 36 pulgadas frente al panel, despejado y sin obstrucciones (NEC 110.26)'],
    ['Grounding electrode conductor installed and connected (NEC 250)','Conductor del electrodo de puesta a tierra instalado y conectado (NEC 250)'],
    ['Ground rods installed - minimum 2 rods 6 ft apart (residential NEC 250.53)','Varillas de tierra instaladas; mínimo 2 varillas separadas 6 pies (NEC 250.53 residencial)'],
    ['AFCI breakers installed where required by NEC 210.12 and Florida amendments','Interruptores AFCI instalados donde los exigen el NEC 210.12 y las enmiendas de Florida'],
    ['GFCI breakers/receptacles at all required locations (NEC 210.8)','Interruptores o tomacorrientes GFCI en todas las ubicaciones requeridas (NEC 210.8)'],
    ['Tamper-resistant receptacles throughout dwelling units (NEC 406.12 - residential)','Tomacorrientes resistentes a manipulación en todas las unidades residenciales (NEC 406.12)'],
    ['Correct voltage at each circuit (120V, 208V, 240V, 480V as applicable)','Voltaje correcto en cada circuito (120 V, 208 V, 240 V o 480 V según corresponda)'],
    ['Voltage balanced between phases (max +/-5% variation)','Voltaje balanceado entre fases (variación máxima de +/-5 %)'],
    ['Tamper-resistant receptacles verified functional (residential)','Tomacorrientes resistentes a manipulación verificados y funcionando (residencial)'],
    ['Smoke detector circuits verified - interconnected and functional (residential - FRC R314)','Circuitos de detectores de humo verificados, interconectados y funcionales (residencial, FRC R314)'],
    ['Devices installed per plans (quantity, type, and location)','Dispositivos instalados según los planos (cantidad, tipo y ubicación)'],
    ['Smoke detectors in all required rooms and corridors (commercial/industrial)','Detectores de humo en todas las habitaciones y pasillos requeridos (comercial o industrial)'],
    ['Smoke alarms in each sleeping room and outside each sleeping area (residential - FRC R314.3)','Alarmas de humo en cada dormitorio y fuera de cada área de descanso (residencial, FRC R314.3)'],
    ['Carbon monoxide alarms installed where required (gas appliances or attached garage - Florida)','Alarmas de monóxido de carbono instaladas donde sean requeridas (aparatos de gas o garaje adjunto, Florida)'],
    ['Pull stations at each required exit (commercial/industrial)','Estaciones manuales de alarma en cada salida requerida (comercial o industrial)'],
    ['All alarms interconnected - when one sounds, all sound (residential - FRC R314.4)','Todas las alarmas interconectadas; cuando suena una, suenan todas (residencial, FRC R314.4)'],
    ['Hardwired with battery backup - no battery-only units (FRC R314.4)','Conectadas permanentemente con respaldo de batería; no se permiten unidades solo con batería (FRC R314.4)'],
    ['Supervised wiring - Class A or B per design (commercial/industrial)','Cableado supervisado, Clase A o B según el diseño (comercial o industrial)'],
    ['System programmed with correct zoning (commercial/industrial)','Sistema programado con la zonificación correcta (comercial o industrial)'],
    ['Sound test: dB level verified in sleeping areas (min 75 dB at pillow - NFPA 72)','Prueba de sonido: nivel de decibeles verificado en las áreas de descanso (mínimo 75 dB en la almohada, NFPA 72)'],
    ['Battery backup test: minimum 24hr standby + 5 min alarm (NFPA 72)','Prueba de respaldo de batería: mínimo de 24 horas en espera y 5 minutos en alarma (NFPA 72)'],
    ['Integration with HVAC, elevator, sprinklers verified (commercial/industrial)','Integración con HVAC, elevador y rociadores verificada (comercial o industrial)'],
    ['Exit signs illuminated correctly (letters clearly visible)','Señales de salida iluminadas correctamente (letras claramente visibles)'],
    ['30-second test completed (press test button - NFPA 101)','Prueba de 30 segundos completada (presionar el botón de prueba, NFPA 101)'],
    ['90-minute battery test completed and documented (NFPA 101 7.9.3)','Prueba de batería de 90 minutos completada y documentada (NFPA 101 7.9.3)'],
    ['Batteries replaced if units are reused (old batteries not permitted)','Baterías reemplazadas cuando se reutilizan las unidades (no se permiten baterías antiguas)'],
    ['Transfer to emergency power verified (simulating power failure)','Transferencia a energía de emergencia verificada mediante simulación de falla eléctrica'],
    ['Ceiling fans balanced and operating on all speeds (residential)','Ventiladores de techo balanceados y funcionando en todas las velocidades (residencial)'],
    ['Tamper-resistant receptacles verified throughout (residential)','Tomacorrientes resistentes a manipulación verificados en toda la unidad (residencial)'],
    ['Smoke alarms interconnected and functional - all sound simultaneously (residential)','Alarmas de humo interconectadas y funcionales; todas suenan simultáneamente (residencial)'],
    ['Fire alarm system fully operational - final test witnessed by AHJ (commercial/industrial)','Sistema de alarma contra incendios completamente operativo; prueba final presenciada por la autoridad competente (comercial o industrial)'],
    ['Arc flash labels in place on electrical room/switchboard (commercial/industrial)','Etiquetas de arco eléctrico instaladas en el cuarto eléctrico o tablero (comercial o industrial)'],
    ['Attic and crawl space wiring properly supported and protected (residential)','Cableado del ático y del espacio de acceso correctamente sostenido y protegido (residencial)'],
    ['Panel directory/circuit schedule complete, legible, and correct','Directorio del panel y cuadro de circuitos completos, legibles y correctos'],
    ['Written authorization to energize received','Autorización escrita para energizar recibida'],
    ['Continuity test completed before energizing','Prueba de continuidad completada antes de energizar'],
    ['Correct voltage at each circuit','Voltaje correcto en cada circuito'],
    ['Voltage balanced between phases','Voltaje balanceado entre fases'],
    ['Correct polarity at all receptacles','Polaridad correcta en todos los tomacorrientes'],
    ['GFCI tested at all required locations - trip and reset functional','GFCI probado en todas las ubicaciones requeridas; disparo y restablecimiento funcionales'],
    ['Breakers operating correctly (trip and reset)','Interruptores funcionando correctamente (disparo y restablecimiento)'],
    ['Results documented on test form with electrician signature and date','Resultados documentados en el formulario de prueba con firma y fecha del electricista'],
    ['All circuits identified and labeled before energizing','Todos los circuitos identificados y etiquetados antes de energizar'],
    ['Megohmmeter (insulation resistance) test completed and documented','Prueba de resistencia de aislamiento con megóhmetro completada y documentada'],
    ['Voltage balanced between phases','Voltaje balanceado entre fases'],
    ['No reversed circuits (hot/neutral)','No hay circuitos invertidos (fase y neutro)'],
    ['No open grounds at any receptacle','No hay tierras abiertas en ningún tomacorriente'],
    ['AFCI tested with test button - all required circuits','AFCI probado con el botón de prueba en todos los circuitos requeridos'],
    ['Tamper-resistant receptacles verified functional','Tomacorrientes resistentes a manipulación verificados y funcionando'],
    ['No floating neutrals or ground faults','No hay neutros flotantes ni fallas de puesta a tierra'],
    ['Load current measured and within circuit capacity','Corriente de carga medida y dentro de la capacidad del circuito'],
    ['Integration with HVAC, elevator, sprinklers verified','Integración con HVAC, elevador y rociadores verificada'],
    ['Approved emergency/exit lighting plans available on site','Planos aprobados de iluminación de emergencia y salidas disponibles en el sitio'],
    ['Emergency light units installed at approved locations','Unidades de iluminación de emergencia instaladas en ubicaciones aprobadas'],
    ['Exit signs installed above each required emergency exit','Señales de salida instaladas sobre cada salida de emergencia requerida'],
    ['Exit signs illuminated correctly','Señales de salida iluminadas correctamente'],
    ['Connection to emergency circuit or internal battery verified','Conexión al circuito de emergencia o a la batería interna verificada'],
    ['30-second test completed','Prueba de 30 segundos completada'],
    ['90-minute battery test completed and documented','Prueba de batería de 90 minutos completada y documentada'],
    ['Batteries replaced if units are reused','Baterías reemplazadas cuando se reutilizan las unidades'],
    ['Test date marked on each unit','Fecha de prueba marcada en cada unidad'],
    ['Transfer to emergency power verified','Transferencia a energía de emergencia verificada'],
    ['Egress path unobstructed and clearly illuminated end to end','Ruta de evacuación despejada e iluminada claramente de principio a fin'],
    ['Signed test certificate filed','Certificado de prueba firmado y archivado'],
    ['All prior inspections completed and approved','Todas las inspecciones anteriores completadas y aprobadas'],
    ['All switches operating correct devices','Todos los interruptores operan los dispositivos correctos'],
    ['All light fixtures functioning correctly','Todos los artefactos de iluminación funcionan correctamente'],
    ['Ceiling fans balanced and operating on all speeds','Ventiladores de techo balanceados y funcionando en todas las velocidades'],
    ['Dimmers functioning without flickering or interference','Atenuadores funcionando sin parpadeos ni interferencias'],
    ['Emergency lights and exit signs operational','Luces de emergencia y señales de salida operativas'],
    ['Panel directory complete, legible, and correct','Directorio del panel completo, legible y correcto'],
    ['No open electrical boxes without covers throughout','No hay cajas eléctricas abiertas sin cubierta en la propiedad'],
    ['Access panels operable and unobstructed','Paneles de acceso operables y sin obstrucciones'],
    ['All prior punch list items completed 100%','Todos los elementos anteriores de la lista de pendientes completados al 100%'],
    ['Permits and inspection cards signed off by AHJ','Permisos y tarjetas de inspección aprobados y firmados por la autoridad competente'],
    ['As-built drawings updated and delivered','Planos conforme a obra actualizados y entregados'],
    ['Equipment manuals and warranties delivered to owner/GC','Manuales y garantías de los equipos entregados al propietario o contratista general'],
    ['Work area clean - no materials, tools, or debris','Área de trabajo limpia, sin materiales, herramientas ni escombros'],
    ['Rough In / Walls','Preinstalación / Paredes'], ['Overhead Rough','Preinstalación de techos'],
    ['Electrical Room / Switchboard / Electrical Panel / Load Center','Cuarto eléctrico / Tablero / Panel eléctrico / Centro de carga'],
    ['Pre Power','Preenergización'], ['Hot Check','Prueba en caliente'], ['Fire Alarm','Alarma contra incendios'],
    ['Emergency Light','Luz de emergencia'], ['Final Inspection','Inspección final'], ['Underground Electrical','Inspección eléctrica subterránea'], ['Fire Stop','Sellado contra incendios'],
    ['Approved underground electrical plans and utility layout are available on site','Los planos eléctricos subterráneos aprobados y la distribución de servicios están disponibles en el sitio'],
    ['The underground route matches the approved plans','La ruta subterránea coincide con los planos aprobados'],
    ['Trench depth and cover meet the approved project requirements','La profundidad y cobertura de la zanja cumplen con los requisitos aprobados del proyecto'],
    ['The conduit or wiring method is suitable for underground installation','El conduit o método de cableado es adecuado para una instalación subterránea'],
    ['Conduit is properly supported, protected, and free of damage','El conduit está correctamente sostenido, protegido y libre de daños'],
    ['Conductors, cables, terminals, and connections are suitable for damp or wet conditions','Los conductores, cables, terminales y conexiones son adecuados para condiciones húmedas o mojadas'],
    ['Required separation from water, gas, communications, and other utilities is maintained','Se mantiene la separación requerida de agua, gas, comunicaciones y otros servicios'],
    ['Warning tape or underground identification markers are installed where required','La cinta de advertencia o los marcadores subterráneos están instalados donde corresponde'],
    ['Conduit is protected where it comes out of the ground or becomes exposed','El conduit está protegido donde sale del terreno o queda expuesto'],
    ['Building sleeves, wall penetrations, and conduit ends are sealed against water and gases','Los sleeves del edificio, las penetraciones de muros y los extremos del conduit están sellados contra agua y gases'],
    ['Underground boxes and conduit fittings allow drainage and prevent water accumulation','Las cajas subterráneas y los accesorios del conduit permiten el drenaje y evitan la acumulación de agua'],
    ['Bends, pull points, and pull boxes allow the conductors to be installed and serviced safely','Las curvas, puntos de halado y cajas de halado permiten instalar y mantener los conductores de forma segura'],
    ['Conductor sizes match the approved plans and the required electrical load','El tamaño de los conductores coincide con los planos aprobados y la carga eléctrica requerida'],
    ['Neutral and grounding conductors are correctly identified, routed, and terminated','Los conductores neutro y de puesta a tierra están correctamente identificados, tendidos y terminados'],
    ['Grounding and bonding connections are complete and properly installed','Las conexiones de puesta a tierra y equipotencialidad están completas y correctamente instaladas'],
    ['Splices and terminations are inside approved, accessible, and protected enclosures','Los empalmes y terminaciones están dentro de cajas aprobadas, accesibles y protegidas'],
    ['The installation was inspected, photographed, and approved before backfill','La instalación fue inspeccionada, fotografiada y aprobada antes del relleno'],
    ['Measurements, test results, warning locations, and as-built information are complete','Las mediciones, resultados de pruebas, ubicaciones de advertencia e información conforme a obra están completos'],
    ['Approved underground electrical plans and utility layout are available on site (NEC 110.3(B))','Los planos eléctricos subterráneos aprobados y la distribución de servicios están disponibles en el sitio (NEC 110.3(B))'],
    ['The underground route matches the approved plans and site layout','La ruta subterránea coincide con los planos aprobados y la distribución del sitio'],
    ['Measure and record the required cover using the applicable row and column of NEC Table 300.5; do not use one fixed depth for every installation','Mida y registre la cobertura requerida usando la fila y columna correspondientes de la Tabla 300.5 del NEC; no use una sola profundidad para todas las instalaciones'],
    ['If rock prevents the required cover, the approved raceway and concrete protection are provided as allowed by Table 300.5 (minimum 2 in. concrete where applicable)','Si la roca impide alcanzar la cobertura requerida, se proporciona la canalización aprobada y la protección de concreto permitida por la Tabla 300.5 (mínimo 2 pulgadas de concreto cuando corresponda)'],
    ['The conduit or wiring method is listed and suitable for underground installation (NEC 110.3(B), Chapter 3)','El conduit o método de cableado está certificado y es adecuado para una instalación subterránea (NEC 110.3(B), Capítulo 3)'],
    ['Conductors, cables, terminals, and connections are suitable for damp or wet conditions (NEC 300.5(B), 310.10(C))','Los conductores, cables, terminales y conexiones son adecuados para condiciones húmedas o mojadas (NEC 300.5(B), 310.10(C))'],
    ['For applicable underground service conductors, warning ribbon is installed at least 12 in. above the installation when buried 18 in. or more below grade (NEC 300.5(D)(3))','Para conductores de servicio subterráneos cuando corresponda, la cinta de advertencia está instalada al menos 12 pulgadas por encima cuando están enterrados a 18 pulgadas o más bajo el nivel del terreno (NEC 300.5(D)(3))'],
    ['Where wiring emerges from grade, physical protection extends at least 8 ft above finished grade and no more than 18 in. below grade (NEC 300.5(D)(1))','Cuando el cableado sale del terreno, la protección física se extiende al menos 8 pies sobre el nivel terminado y no más de 18 pulgadas bajo el nivel del terreno (NEC 300.5(D)(1))'],
    ['Raceways installed under a building use an approved method and are protected as required (NEC 300.5(C))','Las canalizaciones instaladas bajo un edificio utilizan un método aprobado y están protegidas según corresponda (NEC 300.5(C))'],
    ['Building sleeves, wall penetrations, and raceway ends are sealed against water and gases (NEC 300.5(G), 300.5(J))','Los sleeves del edificio, las penetraciones de muros y los extremos de las canalizaciones están sellados contra agua y gases (NEC 300.5(G), 300.5(J))'],
    ['Underground boxes and fittings allow drainage and prevent water accumulation (NEC 300.5(B), 314.15)','Las cajas subterráneas y los accesorios permiten el drenaje y evitan la acumulación de agua (NEC 300.5(B), 314.15)'],
    ['For angle or U pulls and splices, pull-box dimensions provide at least 6 times the largest raceway trade size, plus added entry distances where required (NEC 314.28)','Para halados en ángulo o en U y empalmes, las dimensiones de la caja proporcionan al menos 6 veces el tamaño comercial de la canalización más grande, más las distancias adicionales requeridas (NEC 314.28)'],
    ['Conductor sizes match the approved plans, electrical load, overcurrent protection, and voltage-drop requirements','El tamaño de los conductores coincide con los planos aprobados, la carga eléctrica, la protección contra sobrecorriente y los requisitos de caída de tensión'],
    ['Neutral and equipment-grounding conductors are correctly identified, routed, and terminated (NEC 200.6, 250.119)','Los conductores neutro y de puesta a tierra del equipo están correctamente identificados, tendidos y terminados (NEC 200.6, 250.119)'],
    ['Grounding and bonding connections are complete and properly installed (NEC Article 250)','Las conexiones de puesta a tierra y equipotencialidad están completas y correctamente instaladas (Artículo 250 del NEC)'],
    ['Splices and terminations are inside approved, accessible, and protected enclosures; no unapproved buried splice is present','Los empalmes y terminaciones están dentro de cajas aprobadas, accesibles y protegidas; no hay empalmes enterrados sin aprobación'],
    ['The installation was inspected, photographed, tested, and approved before backfill; measurements and as-built information are complete','La instalación fue inspeccionada, fotografiada, probada y aprobada antes del relleno; las mediciones y la información conforme a obra están completas'],
    ['Approved underground electrical plans, utility layout, and revisions available (NEC 110.3(B))','Planos eléctricos subterráneos aprobados, distribución de servicios y revisiones disponibles (NEC 110.3(B))'],
    ['Raceway or direct-burial wiring method is permitted, listed, and installed per its listing (NEC 110.3(B), Chapter 3)','El método de canalización o cableado enterrado directo está permitido, listado e instalado conforme a su certificación (NEC 110.3(B), Capítulo 3)'],
    ['Minimum cover is verified using the applicable wiring-method row and column of NEC Table 300.5','La cobertura mínima se verifica usando la fila y columna correspondientes al método de cableado en la Tabla 300.5 del NEC'],
    ['Trench route, depth, clearances, and finished-grade elevations match the approved design (NEC 300.5(A))','La ruta, profundidad, separaciones y elevaciones de acabado de la zanja coinciden con el diseño aprobado (NEC 300.5(A))'],
    ['Underground raceway is treated as a wet location; conductors, cable, terminals, and splices are listed for wet locations (NEC 300.5(B), 310.10(C))','La canalización subterránea se considera un lugar húmedo; conductores, cables, terminales y empalmes están certificados para lugares húmedos (NEC 300.5(B), 310.10(C))'],
    ['Conduit type, trade size, schedule, and mechanical protection are correct for the location (NEC 300.5(D), 352, 358)','El tipo, tamaño comercial, cédula y protección mecánica del conduit son correctos para la ubicación (NEC 300.5(D), 352, 358)'],
    ['Raceway is protected from physical damage where it emerges from grade or is exposed (NEC 300.5(D)(1))','La canalización está protegida contra daños físicos donde emerge del terreno o queda expuesta (NEC 300.5(D)(1))'],
    ['Required warning ribbon or marking is installed above buried conductors or raceways (NEC 300.5(D)(3), where applicable)','La cinta o señalización de advertencia requerida está instalada sobre los conductores o canalizaciones enterrados (NEC 300.5(D)(3), cuando corresponda)'],
    ['Required separation from water, gas, communications, and other utilities is maintained per plans and adopted code','Se mantienen las separaciones requeridas de agua, gas, comunicaciones y otros servicios según los planos y el código adoptado'],
    ['Raceways under buildings use an approved method and are encased or protected where required (NEC 300.5(E))','Las canalizaciones bajo edificios usan un método aprobado y están encamisadas o protegidas cuando corresponde (NEC 300.5(E))'],
    ['Building penetrations and raceway ends are sealed against moisture and gases (NEC 300.5(G), 300.5(J))','Las penetraciones del edificio y los extremos de las canalizaciones están sellados contra humedad y gases (NEC 300.5(G), 300.5(J))'],
    ['Raceway drainage, underground boxes, and fittings prevent water accumulation and are listed for the location (NEC 300.5(B), 314.15)','El drenaje de las canalizaciones, las cajas subterráneas y los accesorios evitan la acumulación de agua y están certificados para la ubicación (NEC 300.5(B), 314.15)'],
    ['Conduit bends, pull points, and pull boxes provide the required access and bending space (NEC 314.28, 352.26, 358.26)','Las curvas, puntos de halado y cajas de halado proporcionan el acceso y espacio de curvatura requeridos (NEC 314.28, 352.26, 358.26)'],
    ['Conductors are sized for ampacity, temperature, overcurrent protection, and voltage drop per the approved design (NEC 215.2, 215.3, 310.16)','Los conductores tienen el tamaño adecuado para ampacidad, temperatura, protección contra sobrecorriente y caída de tensión según el diseño aprobado (NEC 215.2, 215.3, 310.16)'],
    ['Neutral and equipment grounding conductors are identified, routed, and terminated correctly (NEC 200.6, 250.119, 250.32(B) where applicable)','Los conductores neutro y de puesta a tierra del equipo están identificados, tendidos y terminados correctamente (NEC 200.6, 250.119, 250.32(B), cuando corresponda)'],
    ['Grounding electrode, bonding, and service/feeder requirements are complete where applicable (NEC 250.32, 250.50, 250.53)','Los requisitos de electrodo de puesta a tierra, equipotencialidad y servicio o alimentador están completos cuando corresponde (NEC 250.32, 250.50, 250.53)'],
    ['Splices and terminations are accessible, listed, protected, and not buried without an approved enclosure (NEC 110.14, 300.5(I), 314.29)','Los empalmes y terminaciones son accesibles, certificados y protegidos; no están enterrados sin una caja aprobada (NEC 110.14, 300.5(I), 314.29)'],
    ['Inspection, photos, measurements, test results, warning locations, and as-built records are complete before backfill (NEC 300.5 and project requirements)','La inspección, fotos, mediciones, resultados de pruebas, ubicaciones de advertencia y registros conforme a obra están completos antes del relleno (NEC 300.5 y requisitos del proyecto)'],
    ['Approved underground electrical plans and utility layout available on site','Planos eléctricos subterráneos aprobados y distribución de servicios disponibles en el sitio'],
    ['Underground route matches the approved plans and required clearances','La ruta subterránea coincide con los planos aprobados y mantiene las separaciones requeridas'],
    ['Trench depth and cover meet the approved design and applicable code','La profundidad y cobertura de la zanja cumplen con el diseño aprobado y el código aplicable'],
    ['Conduit type, size, schedule, and rating are correct for the installation','El tipo, tamaño, cédula y clasificación del conduit son correctos para la instalación'],
    ['Conduit is properly bedded, supported, protected, and free of damage','El conduit está correctamente asentado, sostenido y protegido, sin daños'],
    ['Required separation from plumbing, gas, communications, and other utilities','Se mantiene la separación requerida de plomería, gas, comunicaciones y otros servicios'],
    ['Sweeps, bends, and pull points meet the permitted radius and access requirements','Las curvas, dobleces y puntos de halado cumplen con el radio permitido y los requisitos de acceso'],
    ['Conduit ends are capped, sealed, and protected from water and debris','Los extremos del conduit están tapados, sellados y protegidos contra agua y residuos'],
    ['Pull strings or pulling provisions are installed where required','Se instalaron cordones guía o medios de halado donde corresponde'],
    ['Grounding and bonding conductors are installed and identified correctly','Los conductores de puesta a tierra y equipotencialidad están instalados e identificados correctamente'],
    ['Sleeves, wall penetrations, and waterproofing are sealed as specified','Los sleeves, penetraciones de muros e impermeabilizaciones están sellados según las especificaciones'],
    ['Underground installation was inspected and documented before backfill','La instalación subterránea fue inspeccionada y documentada antes del relleno'],
    ['Photos, measurements, test results, and as-built information are complete','Las fotos, mediciones, resultados de pruebas e información conforme a obra están completos'],
    ['Approved','Aprobado'], ['electrical','eléctrico'], ['plans','planos'], ['available on site','disponibles en el sitio'],
    ['available','disponible'], ['required','requerido'], ['correct','correcto'], ['per specifications','según las especificaciones'],
    ['per code','según el código'], ['per plans','según los planos'], ['installed','instalado'], ['installation','instalación'],
    ['secured','asegurado'], ['supported','sostenido'], ['separated from','separado de'], ['separation','separación'],
    ['between','entre'], ['without','sin'], ['with','con'], ['and','y'], ['or','o'], ['where required','donde sea requerido'],
    ['at correct height','a la altura correcta'], ['location','ubicación'], ['locations','ubicaciones'], ['accessible','accesible'],
    ['identified','identificado'], ['documented','documentado'], ['protected','protegido'], ['penetrations','penetraciones'],
    ['assemblies','conjuntos'], ['material','material'], ['devices','dispositivos'], ['detectors','detectores'],
    ['alarms','alarmas'], ['lights','luces'], ['emergency','emergencia'], ['panel','panel'], ['room','cuarto'],
    ['ceiling','techo'], ['ceilings','techos'], ['wall','pared'], ['walls','paredes'], ['floor','piso'], ['floors','pisos'],
    ['smoke','humo'], ['fire','incendio'], ['power','energía'], ['data','datos'], ['communications','comunicaciones'],
    ['mechanical','mecánico'], ['plumbing','plomería'], ['structural','estructural'], ['cables','cables'], ['cable','cable'],
    ['boxes','cajas'], ['box','caja'], ['circuits','circuitos'], ['circuit','circuito'], ['Minimum','Mínimo'], ['Each','Cada'],
    ['meets','cumple'], ['damage','daño'], ['gaps','espacios'], ['voids','vacíos'],
    ['fully applied','aplicado completamente'], ['where applicable','cuando corresponda']
  ];
  let result = String(value);
  replacements.sort((a,b) => b[0].length - a[0].length).forEach(([from,to]) => {
    const escaped = from.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    const isPhrase = /\s/.test(from) || /[^\w]/.test(from);
    const pattern = isPhrase ? escaped : `\\b${escaped}\\b`;
    result = result.replace(new RegExp(pattern, 'gi'), to);
  });
  return result;
}

// Keep the action bar consistent for every one of the nine inspection types.
// Other view-normalization code may remove/rebuild navigation controls, so the
// checklist actions are restored after that normalization without duplicates.
function inspEnsureChecklistActions() {
  const actions = document.querySelector('#insp-step-checklist .insp-checklist-actions');
  if (!actions) return;
  // The checklist keeps navigation in the header. The footer is reserved for
  // the three workflow actions, in this exact order and aligned to the right.
  actions.querySelectorAll('button[onclick*="inspGoStep(2)"]').forEach(button => button.remove());
  const ensure = (selector, html) => {
    if (!actions.querySelector(selector)) actions.insertAdjacentHTML('beforeend', html);
  };
  ensure('button[onclick*="inspCancelInspection"]', '<button type="button" class="insp-btn insp-btn-outline" onclick="inspCancelInspection()">✕ Cancel</button>');
  ensure('button[onclick*="inspSaveDraftAndReturn"]', '<button type="button" class="insp-btn insp-btn-outline" onclick="inspSaveDraftAndReturn()">💾 Save Draft</button>');
  ensure('button[onclick*="inspSubmit"]', '<button type="button" class="insp-btn insp-btn-success" onclick="inspSubmit()">✅ Submit Inspection</button>');
  const cancel = actions.querySelector('button[onclick*="inspCancelInspection"]');
  const save = actions.querySelector('button[onclick*="inspSaveDraftAndReturn"]');
  const submit = actions.querySelector('button[onclick*="inspSubmit"]');
  [cancel, save, submit].forEach(button => { if (button) actions.appendChild(button); });
}

function inspReturnToTypeList() {
  if (!inspCurrentUnit) {
    inspCurrentUnit = window.inspLastSelectedUnit || null;
    if (!inspCurrentUnit) {
      try { inspCurrentUnit = JSON.parse(sessionStorage.getItem('inspActiveUnit') || 'null'); } catch (_) {}
    }
  }
  if (!inspCurrentUnit) {
    const searchValue = document.getElementById('insp-unit-search')?.value?.trim();
    if (searchValue) {
      const units = Array.isArray(window.data) ? window.data : INSP_DEMO_UNITS;
      inspCurrentUnit = units.find(unit => String(unit.apt || unit.unit_number || '') === searchValue) || null;
    }
  }
  // Fully release the previous inspection before rebuilding the type list.
  // This prevents the first close from leaving a stale overlay or click
  // handler that blocks the next inspection.
  inspResetInspectionViewState();
  const retakeModal = document.getElementById('insp-retake-modal');
  if (retakeModal) {
    retakeModal.classList.remove('show', 'insp-closing');
    retakeModal.style.display = 'none';
    retakeModal.removeAttribute('aria-hidden');
  }
  inspChecklistItems = [];
  inspCurrentType = null;
  window.inspReturnAfterInspection = 'inspection-type-list';
  const newTab = document.getElementById('insp-tab-new');
  if (newTab) {
    newTab.classList.remove('hidden');
    newTab.style.display = 'block';
  }
  if (inspCurrentUnit) {
    inspGoStep(2);
    inspRenderTypeGrid();
    const grid = document.getElementById('insp-type-grid');
    if (grid) {
      grid.style.pointerEvents = 'auto';
      grid.style.position = 'relative';
      grid.style.zIndex = '1';
    }
  } else {
    inspGoStep(1);
  }
}

function inspSetStatus(idx, status) {
  if (status === 'FAIL') {
    inspOpenFailModal(idx);
    return;
  }
  if (status === 'PASS' && inspCurrentUnit && inspCurrentType && inspGetLastInspection(inspCurrentUnit.apt, inspCurrentType.id)) {
    inspOpenPassPhotoModal(idx);
    return;
  }
  inspChecklistItems[idx].status = status;
  if (status === 'PASS' || status === 'NA') {
    inspChecklistItems[idx].comment = '';
    inspChecklistItems[idx].photos = [];
  }
  inspUpdateRowUI(idx);
  inspUpdateProgress();
}

function inspUpdateRowUI(idx) {
  const row = document.getElementById(`insp-row-${idx}`);
  if (!row) return;
  const s = inspChecklistItems[idx].status;
  const photos = Array.isArray(inspChecklistItems[idx].photos) ? inspChecklistItems[idx].photos : [];
  if (!photos.length) row.querySelector('.insp-photo-icon')?.remove();
  else if (!row.querySelector('.insp-photo-icon')) {
    const photoButton = document.createElement('button');
    photoButton.type = 'button';
    photoButton.className = 'insp-photo-icon';
    photoButton.title = 'View photos';
    photoButton.textContent = `📷 ${photos.length}`;
    photoButton.onclick = () => inspOpenChecklistItemPhotos(idx);
    row.querySelector('.insp-item-desc')?.appendChild(photoButton);
  } else {
    row.querySelector('.insp-photo-icon').textContent = `📷 ${photos.length}`;
  }
  if (s !== 'FAIL') {
    row.querySelector('.insp-fail-note')?.remove();
    row.querySelector('.insp-fail-photos')?.remove();
  }
  row.className = s === 'PASS' ? 'insp-row-pass' : s === 'FAIL' ? 'insp-row-fail' : s === 'NA' ? 'insp-row-na' : '';

  ['pass','fail','na'].forEach(b => {
    const el = document.getElementById(`insp-btn-${b}-${idx}`);
    if (el) el.classList.remove('active');
  });

  if (s === 'PASS') document.getElementById(`insp-btn-pass-${idx}`)?.classList.add('active');
  if (s === 'FAIL') document.getElementById(`insp-btn-fail-${idx}`)?.classList.add('active');
  if (s === 'NA') document.getElementById(`insp-btn-na-${idx}`)?.classList.add('active');

  if (s === 'FAIL' && inspChecklistItems[idx].comment) {
    const noteEl = row.querySelector('.insp-fail-note');
    if (!noteEl) {
      const nd = document.createElement('div');
      nd.className = 'insp-fail-note';
      nd.style.cssText = 'font-size:11px;color:#dc2626;margin-top:3px';
      nd.textContent = '💬 ' + inspChecklistItems[idx].comment.substring(0,60) + (inspChecklistItems[idx].comment.length > 60 ? '...' : '');
      row.querySelector('.insp-item-desc').appendChild(nd);
    } else {
      noteEl.textContent = '💬 ' + inspChecklistItems[idx].comment.substring(0,60) + (inspChecklistItems[idx].comment.length > 60 ? '...' : '');
    }
    if (inspChecklistItems[idx].photos.length > 0) {
      let photoEl = row.querySelector('.insp-fail-photos');
      if (!photoEl) {
        photoEl = document.createElement('div');
        photoEl.className = 'insp-fail-photos';
        photoEl.style.cssText = 'font-size:11px;color:#64748b;margin-top:2px';
        row.querySelector('.insp-item-desc').appendChild(photoEl);
      }
      photoEl.textContent = `📷 ${inspChecklistItems[idx].photos.length} foto(s)`;
    }
  }
}

function inspUpdateProgress() {
  inspSaveDraft();
  const total = inspChecklistItems.length;
  const answered = inspChecklistItems.filter(i => i.status !== null).length;
  const pct = total > 0 ? (answered / total * 100) : 0;
  const bar = document.getElementById('insp-progress-bar-fill');
  const txt = document.getElementById('insp-progress-text');
  if (bar) bar.style.width = pct + '%';
  if (txt) txt.textContent = `${answered} / ${total} respondidos`;
}

function inspMarkAll(status) {
  inspChecklistItems.forEach((item, i) => {
    if (item.status === null || item.status !== 'FAIL') {
      item.status = status;
      inspUpdateRowUI(i);
    }
  });
  inspUpdateProgress();
}

// FAIL MODAL
function inspOpenFailModal(idx) {
  inspCurrentFailIdx = idx;
  inspTempPassIdx = null;
  inspTempPhotos = [...(inspChecklistItems[idx].photos || [])];
  inspTempComment = inspChecklistItems[idx].comment || '';

  const itemEl = document.getElementById('insp-fail-modal-item');
  const commentEl = document.getElementById('insp-fail-comment');
  const previewsEl = document.getElementById('insp-photo-previews');
  const punchPrev = document.getElementById('insp-punch-preview');
  const punchText = document.getElementById('insp-punch-preview-text');
  const modal = document.getElementById('insp-fail-modal');

  // Keep the failure dialog above the checklist on iPhone/iPad stacking contexts.
  if (modal && modal.parentElement !== document.body) document.body.appendChild(modal);

  if (itemEl) itemEl.textContent = inspCurrentType.items[idx];
  const title = modal?.querySelector('h4');
  const icon = modal?.querySelector('.insp-fail-icon');
  const photoLabel = modal?.querySelector('.insp-photo-zone')?.previousElementSibling;
  const action = modal?.querySelector('.insp-btn-danger');
  if (title) title.textContent = 'Record Failure';
  if (icon) icon.textContent = '❌';
  if (photoLabel) photoLabel.innerHTML = 'Evidence Photos <span style="color:#dc2626">*</span>';
  if (action) { action.textContent = 'Confirm Failure →'; action.onclick = inspConfirmFail; }
  if (commentEl) commentEl.value = inspTempComment;
  if (previewsEl) previewsEl.innerHTML = '';

  inspTempPhotos.forEach((p, pi) => inspAddPhotoThumb(p, pi));

  if (punchPrev) punchPrev.style.display = inspTempComment ? 'block' : 'none';
  if (punchText) punchText.textContent = inspTempComment;
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.setProperty('position', 'fixed', 'important');
    modal.style.setProperty('inset', '0', 'important');
    modal.style.setProperty('display', 'flex', 'important');
    modal.style.setProperty('z-index', '2147483000', 'important');
    modal.style.setProperty('pointer-events', 'auto', 'important');
  }
  if (modal && !modal.querySelector('.insp-modal-close')) {
    const close = document.createElement('button');
    close.className = 'insp-modal-close';
    close.type = 'button';
    close.textContent = '✕';
    close.title = 'Close';
    close.style.cssText = 'position:absolute;top:10px;right:12px;border:0;background:transparent;font-size:20px;cursor:pointer;color:#64748b';
    close.setAttribute('onclick', 'inspCancelFail()');
    const box = modal.querySelector('.insp-modal');
    if (box) { box.style.position = 'relative'; box.appendChild(close); }
  }
  if (commentEl) {
    commentEl.focus();
    commentEl.oninput = function() {
      inspTempComment = this.value;
      if (punchPrev) punchPrev.style.display = this.value ? 'block' : 'none';
      if (punchText) punchText.textContent = this.value;
    };
  }
}

function inspCancelFail() {
  const modal = document.getElementById('insp-fail-modal');
  if (modal) { modal.classList.add('insp-closing'); setTimeout(() => { modal.classList.add('hidden'); modal.style.display = 'none'; modal.classList.remove('insp-closing'); }, 480); }
  inspCurrentFailIdx = null;
  inspTempPassIdx = null;
}

function inspConfirmFail() {
  const commentEl = document.getElementById('insp-fail-comment');
  const comment = commentEl ? commentEl.value.trim() : '';
  if (!comment) {
    if (commentEl) {
      commentEl.style.borderColor = '#dc2626';
      commentEl.placeholder = '⚠️ A comment is required for a FAILURE';
      commentEl.focus();
    }
    return;
  }
  if (!inspTempPhotos.length) {
    inspShowToast('A photo is required when marking an item as FAIL.', 'error');
    return;
  }

  inspChecklistItems[inspCurrentFailIdx].status = 'FAIL';
  inspChecklistItems[inspCurrentFailIdx].comment = comment;
  inspChecklistItems[inspCurrentFailIdx].photos = [...inspTempPhotos];

  const modal = document.getElementById('insp-fail-modal');
  if (modal) { modal.classList.add('insp-closing'); setTimeout(() => { modal.classList.add('hidden'); modal.style.display = 'none'; modal.classList.remove('insp-closing'); }, 480); }
  inspUpdateRowUI(inspCurrentFailIdx);
  inspUpdateProgress();
  inspCurrentFailIdx = null;
}

function inspOpenPassPhotoModal(idx) {
  inspCurrentFailIdx = null;
  inspTempPassIdx = idx;
  inspTempPhotos = [];
  inspTempComment = '';
  const modal = document.getElementById('insp-fail-modal');
  const itemEl = document.getElementById('insp-fail-modal-item');
  const commentEl = document.getElementById('insp-fail-comment');
  const previewsEl = document.getElementById('insp-photo-previews');
  const title = modal?.querySelector('h4');
  const icon = modal?.querySelector('.insp-fail-icon');
  const photoLabel = modal?.querySelector('.insp-photo-zone')?.previousElementSibling;
  const action = modal?.querySelector('.insp-btn-danger');
  if (itemEl) itemEl.textContent = inspCurrentType?.items?.[idx] || 'Selected item';
  if (title) title.textContent = 'Confirm Correction';
  if (icon) icon.textContent = '✅';
  if (photoLabel) photoLabel.innerHTML = 'Correction Photo <span style="color:#dc2626">*</span>';
  if (commentEl) { commentEl.value = ''; commentEl.placeholder = 'Optional correction note...'; }
  if (previewsEl) previewsEl.innerHTML = '';
  const punchPreview = document.getElementById('insp-punch-preview');
  if (punchPreview) punchPreview.style.display = 'none';
  if (action) { action.textContent = 'Confirm PASS →'; action.onclick = inspConfirmPassPhoto; }
  if (modal) {
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
    modal.style.setProperty('position', 'fixed', 'important');
    modal.style.setProperty('inset', '0', 'important');
    modal.style.setProperty('display', 'flex', 'important');
    modal.style.setProperty('z-index', '2147483000', 'important');
    modal.style.setProperty('pointer-events', 'auto', 'important');
  }
}

function inspConfirmPassPhoto() {
  if (inspTempPassIdx === null || !inspTempPhotos.length) {
    inspShowToast('A new photo is required to confirm a correction.', 'error');
    return;
  }
  const comment = document.getElementById('insp-fail-comment')?.value.trim() || '';
  inspChecklistItems[inspTempPassIdx].status = 'PASS';
  inspChecklistItems[inspTempPassIdx].comment = comment;
  inspChecklistItems[inspTempPassIdx].photos = [...inspTempPhotos];
  const modal = document.getElementById('insp-fail-modal');
  if (modal) { modal.classList.add('insp-closing'); setTimeout(() => { modal.classList.add('hidden'); modal.style.display = 'none'; modal.classList.remove('insp-closing'); }, 480); }
  inspUpdateRowUI(inspTempPassIdx);
  inspUpdateProgress();
  inspTempPassIdx = null;
}

function inspHandlePhotos(input) {
  const files = typeof validatePhotoFiles === 'function' ? validatePhotoFiles(input.files || []) : Array.from(input.files || []);
  const inspector = inspGetCurrentInspector();
  Promise.all(files.map(file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      stampPhotoDataUrl(e.target.result, inspector).then(resolve).catch(reject);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  }))).then(stamped => {
    stamped.forEach(data => { inspTempPhotos.push(data); inspAddPhotoThumb(data, inspTempPhotos.length - 1); });
  }).catch(error => inspShowToast(`Could not prepare photo: ${error.message || 'file error'}`, 'error'));
  input.value = '';
}

function stampPhotoDataUrl(dataUrl, inspector) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const text = photoStampText(inspector);
      const fontSize = Math.max(14, Math.round(canvas.width / 70));
      const padding = Math.max(8, Math.round(fontSize * .55));
      ctx.font = `600 ${fontSize}px Arial, sans-serif`;
      const boxHeight = fontSize + padding * 2;
      ctx.fillStyle = 'rgba(0,0,0,.72)';
      ctx.fillRect(4, canvas.height - boxHeight - 4, canvas.width - 8, boxHeight);
      ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle';
      ctx.fillText(text, 4 + padding, canvas.height - boxHeight / 2 - 4);
      resolve(canvas.toDataURL('image/jpeg', .82));
    };
    img.onerror = () => reject(new Error('Failed to read image'));
    img.src = dataUrl;
  });
}

function inspAddPhotoThumb(data, idx) {
  const wrap = document.getElementById('insp-photo-previews');
  if (!wrap) return;
  const div = document.createElement('div');
  div.className = 'insp-photo-thumb';
  div.innerHTML = `<img src="${data}"><div class="insp-remove-photo" onclick="inspRemovePhoto(${idx})">✕</div>`;
  wrap.appendChild(div);
}

function inspRemovePhoto(idx) {
  inspTempPhotos.splice(idx, 1);
  const wrap = document.getElementById('insp-photo-previews');
  if (wrap) wrap.innerHTML = '';
  inspTempPhotos.forEach((p, pi) => inspAddPhotoThumb(p, pi));
}

function inspOpenPhotoFromGroup(img) {
  const photos = Array.from(img.closest('.insp-photo-previews')?.querySelectorAll('img') || []).map(el => el.dataset.full || el.src);
  const index = Math.max(0, photos.indexOf(img.dataset.full || img.src));
  if (photos.length) inspOpenPhotoViewer(photos, index);
}

function inspOpenChecklistItemPhotos(idx) {
  const photos = inspChecklistItems[idx]?.photos || [];
  if (photos.length) inspOpenPhotoViewer(photos, 0);
}

function inspOpenPhotoViewer(photos, index = 0) {
  let viewer = document.getElementById('insp-photo-viewer');
  if (!viewer) {
    viewer = document.createElement('div');
    viewer.id = 'insp-photo-viewer';
    viewer.style.cssText = 'position:fixed;inset:0;z-index:10100;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;padding:24px;animation:inspPhotoFadeScale .45s ease both';
    viewer.innerHTML = '<div style="position:relative;max-width:92vw;max-height:92vh;text-align:center;color:white"><button id="insp-photo-close" style="position:absolute;right:-12px;top:-18px;border:0;background:white;color:#111;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer">✕</button><img id="insp-photo-viewer-image" style="max-width:88vw;max-height:78vh;object-fit:contain;border-radius:8px"><div id="insp-photo-viewer-count" style="margin:10px"></div><div style="display:flex;gap:8px;justify-content:center"><button id="insp-photo-prev" class="insp-btn insp-btn-outline">← Previous</button><button id="insp-photo-download" class="insp-btn insp-btn-primary">Download</button><button id="insp-photo-next" class="insp-btn insp-btn-outline">Next →</button></div></div>';
    document.body.appendChild(viewer);
    const leftArrow = document.createElement('button');
    leftArrow.textContent = '‹';
    leftArrow.title = 'Previous photo';
    leftArrow.style.cssText = 'position:absolute;left:24px;top:50%;transform:translateY(-50%);border:0;border-radius:50%;background:white;color:#111;font-size:42px;width:52px;height:52px;cursor:pointer;z-index:2';
    leftArrow.onclick = () => { current = (current - 1 + photos.length) % photos.length; render(); };
    const rightArrow = document.createElement('button');
    rightArrow.textContent = '›';
    rightArrow.title = 'Next photo';
    rightArrow.style.cssText = 'position:absolute;right:24px;top:50%;transform:translateY(-50%);border:0;border-radius:50%;background:white;color:#111;font-size:42px;width:52px;height:52px;cursor:pointer;z-index:2';
    rightArrow.onclick = () => { current = (current + 1) % photos.length; render(); };
    viewer.appendChild(leftArrow); viewer.appendChild(rightArrow);
    document.getElementById('insp-photo-close').onclick = () => viewer.remove();
  }
  let current = index;
  const image = document.getElementById('insp-photo-viewer-image');
  const count = document.getElementById('insp-photo-viewer-count');
  const render = () => { image.src = photos[current]; count.textContent = `${current + 1} / ${photos.length}`; };
  document.getElementById('insp-photo-prev').onclick = () => { current = (current - 1 + photos.length) % photos.length; render(); };
  document.getElementById('insp-photo-next').onclick = () => { current = (current + 1) % photos.length; render(); };
  document.getElementById('insp-photo-download').onclick = () => { const a = document.createElement('a'); a.href = photos[current]; a.download = `inspection-photo-${current + 1}.jpg`; a.click(); };
  render();
}

// SUBMIT
// Backward-compatible handler used by the checklist button.
function inspSubmit() { return inspSubmitInspection(); }
async function inspSubmitInspection() {
  const unanswered = inspChecklistItems.filter(i => i.status === null).length;
  if (unanswered > 0) {
    const warn = document.getElementById('insp-submit-warning');
    if (warn) warn.style.display = 'inline';
    inspChecklistItems.forEach((item, i) => {
      const row = document.getElementById(`insp-row-${i}`);
      if (item.status === null && row) {
        row.style.background = '#fffbeb';
        row.style.outline = '2px solid #f59e0b';
      }
    });
    const firstUnanswered = inspChecklistItems.findIndex(i => i.status === null);
    if (firstUnanswered >= 0) {
      document.getElementById(`insp-row-${firstUnanswered}`)?.scrollIntoView({behavior:'smooth', block:'center'});
    }
    return;
  }

  const warn = document.getElementById('insp-submit-warning');
  if (warn) warn.style.display = 'none';

  const inspSel = document.getElementById('insp-inspector-select');
  const inspector = inspSel ? inspSel.value : 'J. Rodriguez';
  const passItems = inspChecklistItems.filter(i => i.status === 'PASS');
  const failItems = inspChecklistItems.filter(i => i.status === 'FAIL');
  const naItems = inspChecklistItems.filter(i => i.status === 'NA');

  const missingFailureEvidence = inspChecklistItems.findIndex(item => item.status === 'FAIL' && (!String(item.comment || '').trim() || !Array.isArray(item.photos) || item.photos.length === 0));
  if (missingFailureEvidence >= 0) {
    inspShowToast('Every FAIL requires a comment and at least one photo.', 'error');
    inspOpenFailModal(missingFailureEvidence);
    return;
  }
  const missingCorrectionEvidence = inspChecklistItems.findIndex((item, index) => {
    const previousItem = inspPriorItemsForReinspection?.[index];
    return previousItem?.status === 'FAIL' && item.status === 'PASS' && (!Array.isArray(item.photos) || item.photos.length === 0);
  });
  if (missingCorrectionEvidence >= 0) {
    inspShowToast('A corrected FAIL requires a new photo before PASS.', 'error');
    inspOpenPassPhotoModal(missingCorrectionEvidence);
    return;
  }
  if (typeof allowRemoteAction === 'function' && !await allowRemoteAction('inspection_submit', 30)) return;

    const previous = inspGetLastInspection(inspCurrentUnit.apt, inspCurrentType.id);
    const now = new Date().toISOString();
  const record = {
      id: Date.now(),
    apt: inspCurrentUnit.apt,
    building: inspCurrentUnit.building,
    floor: inspCurrentUnit.floor,
    typeId: inspCurrentType.id,
    type: inspCurrentType.name,
    typeNum: inspCurrentType.num,
      inspector,
      date: now,
      createdAt: now,
      updatedAt: now,
      completedAt: now,
      previousInspectionDate: previous ? (previous.completedAt || previous.date || previous.createdAt) : null,
      createdBy: window.userName || inspector,
      revision: previous ? Number(previous.revision || 1) + 1 : 1,
      isReinspection: Boolean(previous),
      parentInspectionId: previous ? previous.id : null,
    totalCount: inspChecklistItems.length,
    passCount: passItems.length,
    failedCount: failItems.length,
    naCount: naItems.length,
    items: inspChecklistItems.map((item, i) => ({
      idx: i,
      description: inspCurrentType.items[i],
      status: item.status,
      comment: item.comment || '',
      photoCount: item.photos.length,
      photos: item.photos
    }))
  };

  const inspections = inspGetInspections();
  inspections.push(record);
  inspShowToast('Saving inspection to Supabase...', 'success');
  try {
    await inspSaveInspections(inspections);
  } catch (error) {
    console.error('Remote inspection save failed:', error);
    // Keep the checklist (draft) so the inspector can press Submit again,
    // and drop the unsaved copy so a retry does not create a duplicate.
    const idx = inspections.indexOf(record); if (idx >= 0) inspections.splice(idx, 1);
    inspShowToast(`Could not save — retry. Your answers are kept. (${error.message || 'connection error'})`, 'error');
    return;
  }
  if (typeof addLocalAudit === 'function') addLocalAudit(previous ? 'Reinspection submitted' : 'Inspection submitted', { unit: record.apt, type: record.type, failures: failItems.length, revision: record.revision });
  inspClearDraft();
  window.inspLastSummaryRecord = record;
  if (typeof window.updateInspectionRequiredTasks === 'function') window.updateInspectionRequiredTasks(record);
  if (typeof renderPunchlist === 'function') renderPunchlist();
  if (typeof savePunchlist === 'function') await savePunchlist();
  if (typeof updateMetrics === 'function') updateMetrics();
  if (typeof updateCharts === 'function') updateCharts();

  inspShowSummary(record);
  inspGoStep(4);
  const savedMessage = previous
    ? (failItems.length > 0 ? `Reinspection saved successfully with ${failItems.length} failure(s)` : 'Reinspection saved successfully')
    : (failItems.length > 0 ? `Inspection saved successfully with ${failItems.length} failure(s)` : 'Inspection saved successfully');
  // A saved inspection is successful even when its result contains failures.
  // The FAIL status is shown in the Summary and Punch List, not as a save error.
  inspShowToast(savedMessage, 'success');
}

function inspPrintSummary() {
  const summary = document.getElementById('insp-step-summary');
  if (!summary) return;
  const win = window.open('', '_blank', 'width=1000,height=800');
  if (!win) { alert('Please allow pop-ups to print the summary.'); return; }
  win.document.open();
  win.document.write('<!doctype html><html><head><title>Inspection Summary</title><style>body{font-family:Arial,sans-serif;color:#1f2937;padding:24px}.insp-summary-controls{display:none!important}.insp-card{box-shadow:none!important;max-width:none!important}.insp-summary-header{border:1px solid #cbd5e1;padding:16px}.insp-stat-row{display:flex;gap:10px;margin:16px 0}.insp-stat-box{flex:1;padding:14px;background:#f3f4f6;text-align:center}.insp-row{padding:8px 0;border-bottom:1px solid #e5e7eb}img{max-width:140px;max-height:140px}@media print{body{padding:0}}</style></head><body>' + summary.outerHTML + '</body></html>');
  win.document.close();
  const printWhenReady = () => { win.focus(); win.print(); };
  if (win.document.readyState === 'complete') setTimeout(printWhenReady, 500);
  else win.onload = () => setTimeout(printWhenReady, 250);
}

function inspCloseSummaryView() {
  const popup = document.querySelector('.insp-summary-popup');
  const visibleHistory = document.getElementById('insp-tab-history')?.style.display !== 'none';
  const returnTarget = window.inspReturnAfterInspection || (visibleHistory ? 'history' : 'dashboard');
  if (window.inspSummaryReturnTimer) {
    clearTimeout(window.inspSummaryReturnTimer);
    window.inspSummaryReturnTimer = null;
  }
  if (popup) {
    // Remove the click-blocking overlay immediately when using X.
    inspResetInspectionViewState();
    inspCloseSummaryPopup();
    window.inspSummaryReturnTimer = setTimeout(() => {
      inspResetInspectionViewState();
      if (returnTarget === 'history' || returnTarget === 'punchlist' || returnTarget === 'report') {
        if (returnTarget === 'history' || returnTarget === 'punchlist') window.inspPreserveUnitFilter = returnTarget;
        inspShowTab(returnTarget);
      }
      else if (returnTarget === 'inspection-type-list') {
        const tab = document.querySelector('.tab-main[onclick*=\"inspections\"]');
        if (tab) switchMainTab('inspections', tab);
        inspShowTab('new');
        inspGoStep(2);
        inspRenderTypeGrid();
        const typeGrid = document.getElementById('insp-type-grid');
        if (typeGrid) { typeGrid.style.pointerEvents = 'auto'; typeGrid.style.position = 'relative'; typeGrid.style.zIndex = '1'; }
      } else if (returnTarget === 'unit-search') {
        const apt = inspCurrentUnit?.apt || '';
        const tab = document.querySelector('.tab-main[onclick*=\"inspections\"]');
        if (tab) switchMainTab('inspections', tab);
        inspShowTab('new');
        inspGoStep(1);
        const search = document.getElementById('insp-unit-search');
        if (search && apt) { search.value = String(apt); inspSearchUnits(String(apt)); }
      } else if (returnTarget === 'unit') {
        // Unit List View owns the return screen. Reopen the same details modal
        // instead of navigating through Dashboard, then restore its inspections tab.
        const details = showAppModal('detailsModal');
        document.body.style.overflow = 'hidden';
        if (details && currentDetailsUnit) switchDetailsTab('inspections');
      } else {
        document.body.style.overflow = '';
        switchMainTab('dashboard', document.querySelector('.tab-main[onclick*=dashboard]'));
      }
      window.inspReturnAfterInspection = '';
      window.inspSummaryReturnTimer = null;
    }, 540);
    return;
  }
  if (typeof inspCloseInspectionView === 'function') {
    inspCloseInspectionView();
    return;
  }
  const historyTab = document.querySelector('#insp-tab-history');
  if (historyTab && historyTab.style.display !== 'none' && typeof inspShowTab === 'function') {
    inspShowTab('history');
    return;
  }
  const inspectionsButton = document.querySelector('.tab-main[onclick*="inspections"]');
  if (typeof switchMainTab === 'function') switchMainTab('inspections', inspectionsButton);
}

// Keep inspection navigation icon-only and return to the originating view.
function inspNormalizeNavButtons() {
  const root = document.getElementById('inspectionsTab');
  const normalize = () => document.querySelectorAll('#inspectionsTab button, #insp-fail-modal button, #insp-retake-modal button, .insp-summary-popup button').forEach(button => {
    const label = (button.textContent || '').trim().toLowerCase();
    if (/(back|volver|←|↩)/.test(label)) {
      button.textContent = '\u21a9';
      button.title = 'Back';
      button.setAttribute('aria-label', 'Back');
      button.classList.add('insp-icon-nav');
    } else if (/(close|cerrar|×|Ã—)/.test(label)) {
      button.textContent = '\u00d7';
      button.title = 'Close';
      button.setAttribute('aria-label', 'Close');
      button.classList.add('insp-icon-nav');
    }
  });
  normalize();
  if (root && !root._inspNavObserver) {
    root._inspNavObserver = new MutationObserver(normalize);
    root._inspNavObserver.observe(root, { childList:true, subtree:true });
  }
}

inspNormalizeNavButtons();
// Do not observe text mutations here: changing a button label would otherwise
// trigger the observer again and freeze the page.
const inspNavRoot = document.getElementById('inspectionsTab');
if (inspNavRoot?._inspNavObserver?.disconnect) inspNavRoot._inspNavObserver.disconnect();
if (document.body?._inspGlobalNavObserver?.disconnect) document.body._inspGlobalNavObserver.disconnect();
if (inspNavRoot) inspNavRoot._inspNavObserver = { disconnect() {}, observe() {} };
if (document.body) document.body._inspGlobalNavObserver = { disconnect() {}, observe() {} };

function isInspectionAdmin() {
  // Local mode has no authentication, so it acts as the admin test environment.
  return window.userRole === 'admin' || window.userRole === 'pm' || (typeof LOCAL_PROJECT_MODE !== 'undefined' && (LOCAL_PROJECT_MODE || window.location.protocol === 'file:') && (!window.authIsActive || !window.authIsActive()));
}

async function inspResetCurrentInspection(options = {}) {
  const fileLocalMode = window.location.protocol === 'file:';
  const remoteMode = typeof LOCAL_PROJECT_MODE !== 'undefined' && !LOCAL_PROJECT_MODE && !fileLocalMode;
  if (remoteMode && !sbClient) {
    inspShowToast('Supabase is not connected. The inspection was not reset.', 'error');
    return;
  }

  const record = window.inspLastSummaryRecord || {};
  const unit = inspCurrentUnit || { apt: record.apt };
  const type = inspCurrentType || { id: record.typeId, num: record.typeNum, name: record.type };
  const apt = String(unit?.apt || record.apt || '');
  const typeId = String(type?.id || record.typeId || '');
  const typeNum = String(type?.num || record.typeNum || '');
  const typeName = String(type?.name || record.type || '').trim().toLowerCase();
  if (!apt || (!typeId && !typeNum && !typeName)) {
    inspShowToast('Unable to identify the inspection to reset.', 'error');
    return;
  }

  const confirmed = await new Promise(resolve => askConfirm(
    `Reset inspection for Unit ${apt}? This permanently removes its inspection history, failures, photos, and inspection-generated Punch List items. The unit will return to Not Started.`,
    () => resolve(true),
    () => resolve(false),
    'Reset',
    'Reset Inspection'
  ));
  if (!confirmed) return;

  const sameInspection = item => {
    if (String(item?.apt || '') !== apt) return false;
    return (typeId && String(item?.typeId || '') === typeId)
      || (typeNum && String(item?.typeNum || '') === typeNum)
      || (typeName && String(item?.type || item?.typeName || '').trim().toLowerCase() === typeName);
  };

  try {
    const replaceLocalData = (key, value) => {
      const serialized = JSON.stringify(value);
      try {
        localStorage.setItem(key, serialized);
      } catch (storageError) {
        // Photos can fill the quota. Removing the old large value first
        // releases space before writing the reduced dataset.
        if (!/quota|storage/i.test(String(storageError?.name || storageError?.message || ''))) throw storageError;
        try { localStorage.removeItem('identus_remote_data_cache'); } catch (_) {}
        localStorage.removeItem(key);
        try {
          localStorage.setItem(key, serialized);
        } catch (retryError) {
          if (key === 'inspections_data') {
            const compactHistory = Array.isArray(value) ? value.map(record => ({
              ...record,
              items: Array.isArray(record.items) ? record.items.map(item => ({
                ...item,
                photos: [],
                photoCount: item.photoCount || (Array.isArray(item.photos) ? item.photos.length : 0)
              })) : record.items
            })) : value;
            localStorage.setItem(key, JSON.stringify(compactHistory));
          } else if (key === 'local_punchlist') {
            // Inspection photos remain in inspections_data/Summary. Avoid
            // storing a second base64 copy inside the Punch List.
            const compact = Array.isArray(value) ? value.map(item => item?.source === 'inspection'
              ? { ...item, photos: [], photoCount: item.photoCount || 0 }
              : item) : value;
            localStorage.setItem(key, JSON.stringify(compact));
          } else {
            throw retryError;
          }
        }
      }
    };
    const inspections = inspGetInspections();
    const keptInspections = inspections.filter(item => !sameInspection(item));
    if (LOCAL_PROJECT_MODE || fileLocalMode) {
      inspRemoteRecords = keptInspections;
      replaceLocalData('inspections_data', keptInspections);
    } else {
      const remoteUnit = (Array.isArray(data) ? data : []).find(u => String(u.apt) === apt);
      if (!remoteUnit?.id) throw new Error('The selected unit is not synchronized with Supabase.');
      const { data: typeRows, error: typeError } = await sbClient
        .from('inspection_types').select('id').eq('project_id', PROJECT_ID).eq('code', typeId).limit(1);
      if (typeError) throw typeError;
      const remoteTypeId = typeRows?.[0]?.id;
      if (!remoteTypeId) throw new Error('The inspection type is not configured in Supabase.');
      const { data: remoteRecords, error: recordError } = await sbClient
        .from('inspection_records').select('id').eq('project_id', PROJECT_ID)
        .eq('unit_id', remoteUnit.id).eq('inspection_type_id', remoteTypeId);
      if (recordError) throw recordError;
      const remoteRecordIds = (remoteRecords || []).map(row => row.id).filter(Boolean);
      if (remoteRecordIds.length) {
        // Remove checklist rows explicitly before the parent records.  This
        // keeps the reset reliable even if a project was created without the
        // expected cascade constraint.
        const { error: itemDeleteError } = await sbClient.from('inspection_record_items').delete()
          .in('inspection_record_id', remoteRecordIds);
        if (itemDeleteError) throw itemDeleteError;
      }
      // Older Punch List rows may not have inspection_id yet. Remove every
      // inspection-generated row for this unit/type as well, so reset leaves
      // no stale failure, history, or related trace behind.
      const { data: remotePunchRows, error: punchLoadError } = await sbClient.from('punch_list')
        .select('id,inspection_id,source,type,type_num,unit_id,location')
        .eq('project_id', PROJECT_ID).eq('unit_id', remoteUnit.id);
      if (punchLoadError) throw punchLoadError;
      const punchIds = (remotePunchRows || []).filter(row => {
        const linked = remoteRecordIds.includes(row.inspection_id);
        const generated = row.source === 'inspection';
        const sameType = (typeNum && String(row.type_num || '') === typeNum)
          || (typeName && String(row.type || '').trim().toLowerCase() === typeName);
        return linked || (generated && sameType);
      }).map(row => row.id).filter(Boolean);
      for (let i = 0; i < punchIds.length; i += 100) {
        const { error: punchError } = await sbClient.from('punch_list').delete()
          .eq('project_id', PROJECT_ID).in('id', punchIds.slice(i, i + 100));
        if (punchError) throw punchError;
      }
      if (remoteRecordIds.length) {
        const { error: deleteRecordError } = await sbClient.from('inspection_records').delete()
          .eq('project_id', PROJECT_ID).in('id', remoteRecordIds);
        if (deleteRecordError) throw deleteRecordError;
      }
      const { data: authData } = await sbClient.auth.getUser();
      const inspectorId = authData?.user?.id;
      if (inspectorId) {
        const { error: draftError } = await sbClient.from('inspection_drafts').delete()
          .eq('project_id', PROJECT_ID).eq('unit_id', remoteUnit.id)
          .eq('inspection_type_id', remoteTypeId).eq('inspector_id', inspectorId);
        if (draftError) throw draftError;
      }
      inspRemoteRecords = keptInspections;
    }

    if (Array.isArray(punchlist)) {
      punchlist = punchlist.filter(item => {
        const inspectionDerived = item?.source === 'inspection'
          || String(item?.id || '').startsWith('inspection-')
          || Boolean(item?.inspectionId);
        const relatedInspection = sameInspection({
          apt: item.location || item.apt,
          typeId: item.typeId,
          typeNum: item.typeNum,
          type: item.type || item.typeName
        });
        if (!inspectionDerived && !relatedInspection) return true;
        return !relatedInspection;
      });
      if (LOCAL_PROJECT_MODE || fileLocalMode) replaceLocalData('local_punchlist', punchlist);
      else if (!fileLocalMode) await savePunchlist();
    }

    if (LOCAL_PROJECT_MODE || fileLocalMode) {
      localStorage.removeItem(`inspection_draft_${apt}_${typeId}`);
      try {
        const audit = JSON.parse(localStorage.getItem('local_audit_log') || '[]');
        localStorage.setItem('local_audit_log', JSON.stringify(audit.filter(entry => {
          const details = entry?.details || {};
          const inspectionAction = /inspection submitted|reinspection submitted/i.test(String(entry?.action || ''));
          return !(inspectionAction && String(details.unit || '') === apt && String(details.type || '').trim().toLowerCase() === typeName);
        })));
      } catch (_) {}
    }

    const refreshAfterReset = fn => {
      try { if (typeof fn === 'function') fn(); }
      catch (refreshError) { console.warn('Reset refresh warning:', refreshError); }
    };
    refreshAfterReset(renderPunchlist);
    refreshAfterReset(inspLoadPunchList);
    refreshAfterReset(updateMetrics);
    refreshAfterReset(updateCharts);
    refreshAfterReset(renderUnits);
    window.inspLastSummaryRecord = null;
    if (options.returnToCards) {
      refreshAfterReset(inspRenderTypeGrid);
    } else {
      refreshAfterReset(inspCloseSummaryView);
    }
    const resetMessage = (localStorage.getItem('cfg_language') || 'en') === 'es'
      ? 'Inspección reiniciada correctamente. Se eliminaron el historial, fallos, fotos y Punch List relacionados.'
      : 'Inspection reset successfully. History, failures, photos, and related Punch List items were removed.';
    inspShowToast(resetMessage, 'success');
  } catch (error) {
    console.error('Inspection reset failed:', error);
    inspShowToast(`Inspection reset failed: ${error.message || 'unknown error'}`, 'error');
  }
}

async function inspResetInspectionCard(typeId) {
  if (!inspCurrentUnit) return;
  const type = INSP_INSPECTION_TYPES.find(item => String(item.id) === String(typeId));
  if (!type) return;
  inspCurrentType = type;
  window.inspLastSummaryRecord = inspGetLastInspection(inspCurrentUnit.apt, type.id) || null;
  await inspResetCurrentInspection({ returnToCards: true });
}

function inspShowSummary(record) {
  const existingToast = document.getElementById('insp-toast');
  if (existingToast) {
    clearTimeout(window.inspToastTimer);
    existingToast.classList.add('insp-toast-hide');
    existingToast.style.transform = 'translateY(100px)';
    existingToast.style.opacity = '0';
  }
  // Always render the complete configured checklist. Older/sparse records may
  // contain only answered items, so fill the missing rows from the type.
  const savedItems = Array.isArray(record.items) ? record.items : [];
  const configuredItems = Array.isArray(inspCurrentType?.items) ? inspCurrentType.items : [];
  if (configuredItems.length > savedItems.length) {
    record.items = configuredItems.map((description, index) => ({
      ...(savedItems[index] || {}),
      idx: index,
      description: savedItems[index]?.description || description,
      status: savedItems[index]?.status || 'N/A',
      comment: savedItems[index]?.comment || '',
      photos: savedItems[index]?.photos || [],
      photoCount: savedItems[index]?.photoCount || (savedItems[index]?.photos || []).length
    }));
  }
  const hasFail = record.failedCount > 0;
  const hasStarted = (record.items || []).some(item => item.status === 'PASS' || item.status === 'FAIL' || item.status === 'N/A');

  const header = document.getElementById('insp-summary-header');
  if (header) { header.className = `insp-summary-header${hasFail ? ' has-fail' : ''}`; header.style.position = 'relative'; header.style.paddingRight = '190px'; }
  header?.querySelectorAll('.insp-summary-controls').forEach(el => el.remove());
  if (header && !header.querySelector('.insp-summary-controls')) {
    const controls = document.createElement('div');
    controls.className = 'insp-summary-controls';
    controls.style.cssText = 'position:absolute;top:12px;right:12px;display:flex;gap:6px;z-index:2';
    controls.dataset.printEnabled = '1';
    controls.innerHTML = '<button type="button" title="Back" aria-label="Back" class="insp-btn insp-btn-outline insp-btn-sm insp-icon-nav" onclick="inspGoStep(3)">↩</button><button type="button" title="Close" aria-label="Close" class="insp-btn insp-btn-outline insp-btn-sm insp-icon-nav" onclick="switchMainTab(\'dashboard\',document.querySelector(\'.tab-main[onclick*=dashboard]\'))">×</button>';
    const printButton = document.createElement('button');
    printButton.type = 'button';
    printButton.className = 'insp-btn insp-btn-outline insp-btn-sm';
    printButton.textContent = 'Print / PDF';
    printButton.title = 'Print or save this summary as PDF';
    printButton.onclick = inspPrintSummary;
    controls.insertBefore(printButton, controls.lastElementChild);
    header.appendChild(controls);
    inspUseSingleCloseControl();
  }
  const summaryCloseButton = header?.querySelector('.insp-summary-controls button:last-child');
  if (summaryCloseButton) {
    summaryCloseButton.onclick = inspCloseSummaryView;
    summaryCloseButton.textContent = '×';
    summaryCloseButton.setAttribute('aria-label', 'Close');
    summaryCloseButton.title = 'Close';
    const summaryBackButton = header?.querySelector('.insp-summary-controls button:first-child');
    if (summaryBackButton) {
      summaryBackButton.onclick = inspCloseSummaryView;
      summaryBackButton.textContent = '\u21a9';
      summaryBackButton.setAttribute('aria-label', 'Back');
      summaryBackButton.title = 'Back';
      summaryBackButton.classList.add('insp-icon-nav');
    }
  }

  const singleSummaryNav = header?.querySelector('.insp-summary-controls');
  if (singleSummaryNav) {
    const navButtons = Array.from(singleSummaryNav.querySelectorAll('button'));
    if (navButtons.length > 1) navButtons[0].remove();
    const returnButton = singleSummaryNav.querySelector('button:last-child');
    if (returnButton) {
      returnButton.textContent = '\u21a9';
      returnButton.onclick = inspCloseSummaryView;
      returnButton.title = 'Return';
      returnButton.setAttribute('aria-label', 'Return');
      returnButton.classList.add('insp-icon-nav');
    }
  }

  const titleEl = document.getElementById('insp-summary-title');
  if (titleEl) titleEl.textContent = !hasStarted
    ? 'Not Started'
    : hasFail
  ? `⚠️ Inspection with ${record.failedCount} Failure(s)`
  : '✅ Inspection Completed — All PASS';

  if (titleEl && hasStarted) titleEl.textContent = hasFail
    ? `⚠️ Inspection with ${record.failedCount} Failure(s)`
    : '✅ Inspection Completed — All PASS';
const dateStr = new Date(record.date).toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});
  const subEl = document.getElementById('insp-summary-sub');
  document.getElementById('insp-summary-history-line')?.remove();
  if (subEl) {
    const formatHistoryDate = value => value ? new Date(value).toLocaleString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '';
    const createdDate = formatHistoryDate(record.createdAt || record.date);
    const completedDate = formatHistoryDate(record.completedAt || record.updatedAt || record.date);
    const previousDate = formatHistoryDate(record.previousInspectionDate);
    const isSpanish = (localStorage.getItem('cfg_language') || 'en') === 'es';
    const historyLine = document.createElement('div');
    historyLine.id = 'insp-summary-history-line';
    historyLine.style.cssText = 'font-size:12px;color:#64748b;margin-top:5px;line-height:1.5';
    historyLine.textContent = isSpanish
      ? `Historial: creado ${createdDate} · ${record.isReinspection ? `reinspeccionado ${createdDate}${previousDate ? ` · inspección anterior ${previousDate}` : ''}` : `completado ${completedDate}`}`
      : `History: created ${createdDate} · ${record.isReinspection ? `reinspected ${createdDate}${previousDate ? ` · previous inspection ${previousDate}` : ''}` : `completed ${completedDate}`}`;
    subEl?.insertAdjacentElement('afterend', historyLine);
  }
  if (subEl) subEl.textContent = `${record.type} · Unit ${record.apt} · ${record.inspector} · ${dateStr}`;

  if (subEl) subEl.textContent = `${record.type} · Unit ${record.apt} · ${record.inspector} · ${dateStr}`;
  const statRow = document.getElementById('insp-stat-row');
  if (statRow) statRow.innerHTML = `
    <div class="insp-stat-box insp-stat-pass">
      <div class="insp-stat-num">${record.passCount}</div>
      <div class="insp-stat-label">✅ PASS</div>
    </div>
    <div class="insp-stat-box insp-stat-fail">
      <div class="insp-stat-num">${record.failedCount}</div>
      <div class="insp-stat-label">❌ FAIL</div>
    </div>
    <div class="insp-stat-box insp-stat-na">
      <div class="insp-stat-num">${record.naCount}</div>
      <div class="insp-stat-label">— N/A</div>
    </div>
    <div class="insp-stat-box">
      <div class="insp-stat-num" style="color:#1e40af">${record.totalCount}</div>
      <div class="insp-stat-label">TOTAL</div>
    </div>
  `;

  const failSection = document.getElementById('insp-fail-list');
  if (hasFail) {
    if (failSection) failSection.classList.remove('hidden');
    if (failSection) failSection.style.display = 'block';
    const failList = document.getElementById('insp-fail-items');
    if (failList) {
      const failItems = record.items.filter(i => i.status === 'FAIL');
      failList.innerHTML = failItems.map(item => `
        <div class="insp-fail-item">
          <div class="insp-fail-item-header">
            <span class="insp-item-num">${String(item.idx+1).padStart(2,'0')}</span>
            <span style="font-size:13px;font-weight:600">${window.esc(item.description)}</span>
          </div>
          <div class="insp-fail-item-body">
            <div class="insp-note">💬 ${window.esc(item.comment)}</div>
            ${item.photoCount > 0 ? `<div class="insp-photo-count">📷 ${item.photoCount} photo(s) attached</div><div class="insp-photo-previews">${(item.photos || []).map(p => `<img loading="lazy" class="insp-photo-thumb" src="${storageThumbnailUrl(p, 240)}" data-full="${p}" onerror="this.onerror=null;this.src=this.dataset.full" alt="Evidence photo">`).join('')}</div>` : ''}
          </div>
        </div>
      `).join('');
    }
  } else {
    if (failSection) failSection.classList.add('hidden');
    if (failSection) failSection.style.display = 'none';
  }
  const summaryItems = document.getElementById('insp-summary-items');
  // Keep one consolidated Summary list; avoid duplicating failed items in a separate Punch List block.
  if (failSection) { failSection.classList.add('hidden'); failSection.style.display = 'none'; }
  if (summaryItems) {
    summaryItems.querySelectorAll('.insp-photo-previews').forEach(group => {
      const itemRow = group.closest('div[style*="border-bottom"]');
      const badge = itemRow?.querySelector('.insp-badge');
      if (badge && badge.textContent.trim() !== 'FAIL') group.remove();
    });
  }
  if (summaryItems) summaryItems.innerHTML = '<h3 style="font-size:14px;margin-bottom:10px">Checklist Review</h3>' + record.items.map(item => `<div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid #e5e7eb"><span class="insp-badge ${item.status === 'PASS' ? 'insp-badge-pass' : item.status === 'FAIL' ? 'insp-badge-fail' : 'insp-badge-na'}">${item.status}</span><div style="flex:1"><div style="font-size:13px">${window.esc(item.description)}</div>${item.comment ? `<div class="insp-note">💬 ${window.esc(item.comment)}</div>` : ''}${item.photos?.length ? `<div class="insp-photo-previews">${item.photos.map((p, photoIndex) => `<img loading="lazy" class="insp-photo-thumb" src="${storageThumbnailUrl(p, 240)}" data-full="${p}" onerror="this.onerror=null;this.src=this.dataset.full" alt="Evidence photo ${photoIndex + 1}" title="Unit ${record.apt} · ${record.building} · ${record.type} · Photo ${photoIndex + 1}">`).join('')}</div>` : ''}</div></div>`).join('');
  if (summaryItems) {
    summaryItems.querySelectorAll('.insp-photo-previews').forEach(group => {
      const row = group.closest('div[style*="border-bottom"]');
      const badge = row?.querySelector('.insp-badge');
      if (badge && badge.textContent.trim() !== 'FAIL') group.remove();
    });
    summaryItems.querySelectorAll('.insp-photo-thumb').forEach(img => {
      img.onclick = event => { event.stopPropagation(); inspOpenPhotoFromGroup(img); };
      img.title = 'View photo';
    });
  }
}

function inspEditCurrentSummary() {
  const record = window.inspLastSummaryRecord;
  if (!record || !inspCurrentType || !inspCurrentUnit) return;
  inspChecklistItems = record.items.map(item => ({
    status: item.status,
    comment: item.comment || '',
    photos: item.photos || []
  }));
  inspGoStep(3);
}

function inspNewInspection() {
  inspCurrentUnit = null;
  inspCurrentType = null;
  inspChecklistItems = [];
  inspPriorItemsForReinspection = null;
  const searchEl = document.getElementById('insp-unit-search');
  const resultsEl = document.getElementById('insp-search-results');
  const hintEl = document.getElementById('insp-search-hint');
  if (searchEl) searchEl.value = '';
  if (searchEl) { searchEl.disabled = false; searchEl.style.pointerEvents = 'auto'; }
  if (resultsEl) { resultsEl.classList.add('hidden'); resultsEl.style.display = 'none'; resultsEl.style.pointerEvents = 'auto'; resultsEl.innerHTML = ''; }
  if (hintEl) hintEl.classList.remove('hidden');
  const newTab = document.getElementById('insp-tab-new');
  if (newTab) { newTab.classList.remove('hidden'); newTab.style.display = 'block'; }
  inspGoStep(1);
}

function inspLoadReport(selectedBuildingArg, selectedFloorArg) {
  const panel = document.getElementById('insp-tab-report');
  if (!panel) return;
  const allRecords = inspGetInspections().map(r => ({...r,
    building: r.building || r.building_name || r.buildingName || '',
    floor: r.floor || r.floor_name || r.floorName || '',
    items: Array.isArray(r.items) ? r.items : [],
    passCount: Number(r.passCount) || 0,
    failedCount: Number(r.failedCount) || 0,
    naCount: Number(r.naCount) || 0
  }));
  // Reports must include every inspection/reinspection record, not only the
  // latest revision for each unit and inspection type.
  let records = allRecords.slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  let filters = panel.querySelector('[data-report-filters]');
  if (!filters) {
    filters = document.createElement('div'); filters.dataset.reportFilters = '1'; filters.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;padding:16px;border-bottom:1px solid #e5e7eb';
    filters.innerHTML = '<select id="insp-report-building" class="insp-select"><option value="">All Buildings</option></select><select id="insp-report-floor" class="insp-select"><option value="">All Floors</option></select><input id="insp-report-unit" type="search" class="insp-select" placeholder="Search unit..." style="min-width:180px">';
    panel.querySelector('[data-report-body]').before(filters);
  }
  const configuredUnits = (typeof data !== 'undefined' && Array.isArray(data)) ? data : (Array.isArray(window.data) ? window.data : []);
  const buildings = [...new Set([...allRecords.map(r => r.building), ...configuredUnits.map(u => u.building || u.building_name || u.buildingName)].filter(Boolean))].sort();
  const floors = [...new Set([...allRecords.map(r => r.floor), ...configuredUnits.map(u => u.floor || u.floor_name || u.floorName)].filter(Boolean))].sort();
  const buildingSelect = document.getElementById('insp-report-building');
  const floorSelect = document.getElementById('insp-report-floor');
  const unitSearch = document.getElementById('insp-report-unit');
  const oldBuilding = selectedBuildingArg !== undefined ? selectedBuildingArg : (buildingSelect?.value || '');
  const oldFloor = selectedFloorArg !== undefined ? selectedFloorArg : (floorSelect?.value || '');
  if (buildingSelect && buildingSelect.options.length <= 1) {
    buildingSelect.innerHTML = '<option value="">All Buildings</option>' + buildings.map(v => `<option value="${String(v).replace(/"/g, '&quot;')}">${v}</option>`).join('');
  }
  if (floorSelect && floorSelect.options.length <= 1) {
    floorSelect.innerHTML = '<option value="">All Floors</option>' + floors.map(v => `<option value="${String(v).replace(/"/g, '&quot;')}">${v}</option>`).join('');
  }
  const applyReportFilters = () => inspLoadReport(buildingSelect?.value || '', floorSelect?.value || '');
  if (buildingSelect) { buildingSelect.value = oldBuilding; buildingSelect.onchange = applyReportFilters; buildingSelect.oninput = applyReportFilters; }
  if (floorSelect) { floorSelect.value = oldFloor; floorSelect.onchange = applyReportFilters; floorSelect.oninput = applyReportFilters; }
  if (unitSearch) { unitSearch.oninput = applyReportFilters; }
  const selectedBuilding = selectedBuildingArg !== undefined
    ? String(selectedBuildingArg || '').trim()
    : String(buildingSelect?.options[buildingSelect.selectedIndex]?.text || '').trim();
  const selectedFloor = selectedFloorArg !== undefined
    ? String(selectedFloorArg || '').trim()
    : String(floorSelect?.options[floorSelect.selectedIndex]?.text || '').trim();
  const selectedUnit = String(unitSearch?.value || '').trim().toLowerCase();
  const sameFilterValue = (value, selected) => !selected || /^all\s+(buildings|floors)$/i.test(selected) || String(value || '').trim().toLowerCase() === String(selected).trim().toLowerCase();
  records = records.filter(r => sameFilterValue(r.building, selectedBuilding) && sameFilterValue(r.floor, selectedFloor) && (!selectedUnit || String(r.apt || r.unit_number || '').toLowerCase().startsWith(selectedUnit)));
  const totals = records.reduce((a, r) => ({ total:a.total+1, pass:a.pass+r.passCount, fail:a.fail+r.failedCount, na:a.na+r.naCount }), {total:0,pass:0,fail:0,na:0});
  const openFails = records.reduce((n, r) => n + r.items.filter(i => i.status === 'FAIL').length, 0);
  const groups = {};
  records.forEach(r => {
    const key = `${r.building || 'Unknown Building'}||${r.floor || 'Unknown Floor'}`;
    if (!groups[key]) groups[key] = { building:r.building || 'Unknown Building', floor:r.floor || 'Unknown Floor', inspections:0, pass:0, fail:0, na:0, units:new Set(), records:[] };
    groups[key].inspections++; groups[key].pass += r.passCount; groups[key].fail += r.failedCount; groups[key].na += r.naCount; groups[key].units.add(String(r.apt || r.unit_number || '')); groups[key].records.push(r);
  });
  const groupRows = Object.values(groups).map(g => `<div class="insp-row"><div style="flex:1"><strong>${g.building}</strong><br><small>${g.floor}</small><br><small>Units: ${Array.from(g.units).filter(Boolean).sort().join(', ') || 'None'}</small><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:7px">${g.records.map(r => { const failed = Number(r.failedCount || 0) > 0; return `<button type="button" class="insp-btn insp-btn-sm" style="border:1px solid ${failed ? '#dc2626' : '#16a34a'};color:${failed ? '#dc2626' : '#16a34a'};background:${failed ? '#fee2e2' : '#dcfce7'}" onclick="inspOpenInspectionRecord('${r.id}')">${r.typeNum || ''} ${failed ? 'FAIL' : 'PASS'} · View ${r.apt}</button>`; }).join('')}</div></div><span>${g.inspections} inspections</span><span class="insp-badge insp-badge-pass">${g.pass} PASS</span><span class="insp-badge insp-badge-fail">${g.fail} FAIL</span><span class="insp-badge insp-badge-na">${g.na} N/A</span></div>`).join('');
  panel.querySelector('[data-report-body]').innerHTML = `<div class="insp-stat-row"><div class="insp-stat-box"><div class="insp-stat-num">${totals.total}</div><div class="insp-stat-label">INSPECTIONS</div></div><div class="insp-stat-box insp-stat-pass"><div class="insp-stat-num">${totals.pass}</div><div class="insp-stat-label">PASS ITEMS</div></div><div class="insp-stat-box insp-stat-fail"><div class="insp-stat-num">${totals.fail}</div><div class="insp-stat-label">FAIL ITEMS</div></div><div class="insp-stat-box insp-stat-na"><div class="insp-stat-num">${totals.na}</div><div class="insp-stat-label">N/A ITEMS</div></div></div><div style="padding:16px"><h3 style="font-size:14px;margin-bottom:10px">Open Failures: ${openFails}</h3><h3 style="font-size:14px;margin:18px 0 10px">Report by Building and Floor</h3>${groupRows || '<div class="insp-empty">No inspection data yet</div>'}</div>`;
}

// HISTORY
function inspLoadHistory() {
  const query = (document.getElementById('insp-history-search')?.value || '').trim().toLowerCase();
  const unitFilter = window.inspHistoryUnitFilter ? String(window.inspHistoryUnitFilter) : '';
  const inspections = [...inspGetInspections()].sort((a, b) =>
    new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0)
  ).filter(r =>
    (!unitFilter || String(r.apt) === unitFilter) &&
    (!query || [r.apt, r.type, r.inspector, r.building].some(v => String(v || '').toLowerCase().includes(query)))
  );
  const container = document.getElementById('insp-history-list');
  if (!container) return;

  if (inspections.length === 0) {
    container.innerHTML = `
      <div class="insp-empty">
        <div class="insp-empty-icon">📋</div>
  <h3>No inspections</h3>
  <p>No inspections recorded yet</p>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="insp-list">${
    inspections.map(r => {
const dateStr = new Date(r.date || r.createdAt || Date.now()).toLocaleDateString('en-US', {year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});
      const badge = r.failedCount > 0
        ? `<span class="insp-badge insp-badge-fail">❌ ${r.failedCount} FAIL</span>`
        : `<span class="insp-badge insp-badge-pass">✅ PASS</span>`;
      return `
        <div class="insp-row">
          <div class="insp-unit">${r.apt}</div>
          <div class="insp-type">${r.typeNum}. ${r.type}<br><small>${r.building}</small><br><small>Inspector: ${r.inspector || 'Unknown'}</small>${r.isReinspection ? `<br><small>Reinspection · Revision ${r.revision || 2}</small>` : ''}</div>
          <div>${badge}</div>
          <div class="insp-date">${dateStr}<br><small>Created: ${r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US') : '-'}<br>Completed: ${r.completedAt ? new Date(r.completedAt).toLocaleDateString('en-US') : '-'}</small></div>
          <div class="insp-actions"><button class="insp-btn insp-btn-sm insp-btn-outline" onclick="inspViewHistoryRecord('${r.id}')">View</button>
            <button class="insp-btn insp-btn-sm insp-btn-outline" onclick="inspRetakeInspection('${r.apt}','${r.typeId}')">🔄 Retomar</button>
          </div>
        </div>
      `;
    }).join('')
  }</div>`;
}

function inspRetakeInspection(apt, typeId) {
  window.inspReturnAfterInspection = 'history';
  inspShowTab('new');
  setTimeout(() => {
    const controls = document.querySelector('#insp-step-checklist .insp-top-controls');
    const closeButton = controls?.querySelectorAll('button')[1];
    if (closeButton) closeButton.onclick = inspCloseInspectionView;
  }, 0);
  const liveUnit = findInspectionEntity(apt);
  inspCurrentUnit = liveUnit || INSP_DEMO_UNITS.find(u => u.apt === apt);
  inspCurrentType = INSP_INSPECTION_TYPES.find(t => String(t.id) === String(typeId));
  if (!inspCurrentUnit || !inspCurrentType) return;
  // Check for prior inspection and show modal
  const prior = inspGetLastInspection(apt, typeId);
  if (prior) {
    inspShowRetakeModal(prior, typeId);
  } else {
    inspChecklistItems = inspCurrentType.items.map(() => ({ status: null, comment: '', photos: [] }));
    inspGoStep(3);
  }
}

function inspResetInspectionViewState() {
  const popup = document.querySelector('.insp-summary-popup');
  if (popup) {
    const summary = popup.querySelector('#insp-step-summary');
    const placeholder = summary?._inspPopupPlaceholder;
    if (summary) {
      if (placeholder?.parentNode) placeholder.parentNode.insertBefore(summary, placeholder.nextSibling);
      summary.setAttribute('style', summary._inspPopupStyle || '');
    }
    popup.remove();
  }
  document.querySelectorAll('#insp-step-search, #insp-step-types, #insp-step-checklist, #insp-step-summary').forEach(step => {
    step.classList.remove('insp-closing');
    step.removeAttribute('aria-hidden');
  });
  const grid = document.getElementById('insp-type-grid');
  if (grid) { grid.style.pointerEvents = 'auto'; grid.style.position = 'relative'; grid.style.zIndex = '1'; }
}

// Summary uses one return arrow only; remove any competing close/back control.
const summaryNavigation = document.querySelector('#insp-summary-header .insp-summary-controls');
if (summaryNavigation) {
  const summaryButtons = Array.from(summaryNavigation.querySelectorAll('button'));
  if (summaryButtons.length > 1) summaryButtons[0].remove();
  const summaryReturn = summaryNavigation.querySelector('button:last-child');
  if (summaryReturn) {
    summaryReturn.textContent = '\u21a9';
    summaryReturn.onclick = inspCloseInspectionView;
    summaryReturn.title = 'Return';
    summaryReturn.setAttribute('aria-label', 'Return');
    summaryReturn.classList.add('insp-icon-nav');
  }
}

function inspUseSingleCloseControl() {
  document.querySelectorAll('#inspectionsTab .insp-top-controls, #inspectionsTab .insp-summary-controls, #inspectionsTab .insp-view-controls, .insp-summary-popup .insp-summary-controls').forEach(group => {
    const buttons = Array.from(group.querySelectorAll('button'));
    if (buttons.length > 1) buttons[0].remove();
    const close = group.querySelector('button:last-child');
    if (close) {
      close.textContent = '\u21a9';
      close.title = 'Return';
      close.setAttribute('aria-label', 'Return');
      close.onclick = inspCloseInspectionView;
      close.classList.add('insp-icon-nav');
    }
  });
  document.querySelectorAll('#insp-step-checklist .insp-checklist-actions > button:first-child').forEach(button => button.remove());
}

if (!document._inspCloseCaptureBound) {
  document._inspCloseCaptureBound = true;
  document.addEventListener('click', event => {
    const closeButton = event.target.closest('#insp-step-checklist .insp-top-controls button:last-child, .insp-summary-popup .insp-summary-controls button:last-child');
    if (!closeButton) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (typeof inspCloseSummaryView === 'function' && closeButton.closest('.insp-summary-popup')) inspCloseSummaryView();
    else if (typeof inspReturnToTypeList === 'function') inspReturnToTypeList();
    else inspCloseInspectionView();
  }, true);
}

function inspCloseInspectionView() {
  const checklist = document.getElementById('insp-step-checklist');
  const checklistWasOpen = !!checklist && !checklist.classList.contains('hidden');
  inspResetInspectionViewState();
  const returnTab = checklistWasOpen ? 'inspection-type-list' : (window.inspReturnAfterInspection || 'dashboard');
  window.inspReturnAfterInspection = '';
  if (returnTab === 'history' || returnTab === 'punchlist' || returnTab === 'report') {
    if (returnTab === 'history' || returnTab === 'punchlist') window.inspPreserveUnitFilter = returnTab;
    inspShowTab(returnTab);
  }
  else if (returnTab === 'inspection-type-list') {
    if (!inspCurrentUnit) {
      inspCurrentUnit = window.inspLastSelectedUnit || null;
      if (!inspCurrentUnit) {
        try { inspCurrentUnit = JSON.parse(sessionStorage.getItem('inspActiveUnit') || 'null'); } catch (_) {}
      }
    }
    const tab = document.querySelector('.tab-main[onclick*=\"inspections\"]');
    if (tab) switchMainTab('inspections', tab);
    inspShowTab('new');
    if (inspCurrentUnit) {
      inspGoStep(2);
      inspRenderTypeGrid();
    } else {
      inspGoStep(1);
    }
    const typeGrid = document.getElementById('insp-type-grid');
    if (typeGrid) { typeGrid.style.pointerEvents = 'auto'; typeGrid.style.position = 'relative'; typeGrid.style.zIndex = '1'; }
  }
  else if (returnTab === 'unit-search') {
    const apt = inspCurrentUnit?.apt || '';
    const tab = document.querySelector('.tab-main[onclick*=\"inspections\"]');
    if (tab) switchMainTab('inspections', tab);
    inspShowTab('new');
    inspGoStep(1);
    const search = document.getElementById('insp-unit-search');
    if (search && apt) { search.value = String(apt); inspSearchUnits(String(apt)); }
  }
  else if (returnTab === 'unit') {
    switchMainTab('dashboard', document.querySelector('.tab-main[onclick*=dashboard]'));
    const details = document.getElementById('detailsModal');
    if (details) { details.style.display = 'flex'; details.classList.add('show'); }
  } else switchMainTab('dashboard', document.querySelector('.tab-main[onclick*=dashboard]'));
}

async function inspViewHistoryRecord(recordId) {
  window.inspReturnAfterInspection = 'history';
  const record = inspGetInspections().find(r => String(r.id) === String(recordId));
  if (!record) return;
  try { await inspEnsureRecordItems(record); }
  catch (error) { inspShowToast('Could not load the inspection details.', 'error'); console.error(error); return; }
  inspCurrentUnit = INSP_DEMO_UNITS.find(u => u.apt === record.apt) || { apt: record.apt, building: record.building, floor: record.floor };
  inspCurrentType = INSP_INSPECTION_TYPES.find(t => String(t.id) === String(record.typeId))
    || INSP_INSPECTION_TYPES.find(t => t.name === record.type || String(t.num) === String(record.typeNum));
  if (!inspCurrentType && record.items?.length) {
    inspCurrentType = { id: record.typeId, name: record.type || 'Inspection', num: record.typeNum || '', items: record.items.map(item => item.description) };
  }
  if (!inspCurrentType) return;
  window.inspLastSummaryRecord = record;
  inspShowSummary(record);
  setTimeout(() => inspShowSummaryPopup(), 0);
}

function inspOpenUnitInspectionSummary(apt, typeId) {
  const fromUnitView = document.getElementById('detailsModal')?.classList.contains('show');
  window.inspHistoryUnitFilter = String(apt);
  window.inspReturnAfterInspection = fromUnitView ? 'unit' : 'dashboard';
  const records = inspGetInspections().filter(r => String(r.apt) === String(apt) && String(r.typeId) === String(typeId));
  const latest = records.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))[0];
  if (latest) return inspOpenInspectionRecord(latest.id);
  const openUnit = (typeof currentDetailsUnit !== 'undefined' && currentDetailsUnit && String(currentDetailsUnit.apt) === String(apt)) ? currentDetailsUnit : null;
  const unit = openUnit || (Array.isArray(window.data) ? window.data : []).find(u => String(u.apt || u.unit_number || '') === String(apt))
    || (typeof findInspectionEntity === 'function' ? findInspectionEntity(apt) : null)
    || INSP_DEMO_UNITS.find(u => String(u.apt) === String(apt)) || { apt, building: '', floor: '' };
  const type = INSP_INSPECTION_TYPES.find(t => String(t.id) === String(typeId));
  if (!type) return;
  if (!inspIsInspectionTypeApplicableForUnit(type, unit)) {
    alert('This inspection type is not applicable to the selected building.');
    return;
  }
  inspCurrentUnit = unit;
  inspCurrentType = type;
  const emptyRecord = {
    apt: unit.apt, building: unit.building, floor: unit.floor, type: type.name,
    typeId: type.id, typeNum: type.num, inspector: window.userName || 'Signed-in User',
    date: new Date().toISOString(), passCount: 0, failedCount: 0, naCount: 0,
    totalCount: type.items.length, items: type.items.map((description, idx) => ({ idx, description, status: null, comment: '', photos: [] }))
  };
  if (!fromUnitView) {
    const tab = document.querySelector('.tab-main[onclick*="inspections"]');
    if (tab) switchMainTab('inspections', tab);
    inspShowTab('new');
  }
  window.inspLastSummaryRecord = emptyRecord;
  if (fromUnitView) inspHideUnitDetailsForSummary();
  inspShowSummary(emptyRecord);
  inspShowSummaryPopup();
}

function inspHideUnitDetailsForSummary() {
  const details = document.getElementById('detailsModal');
  if (!details) return;
  details.classList.remove('show');
  details.style.display = 'none';
  details.setAttribute('aria-hidden', 'true');
}

async function inspOpenInspectionRecord(recordId) {
  const fromUnitView = document.getElementById('detailsModal')?.classList.contains('show');
  const fromReport = document.getElementById('insp-tab-report')?.style.display !== 'none';
  window.inspReturnAfterInspection = fromReport ? 'report' : (fromUnitView ? 'unit' : 'history');
  const allRecords = inspGetInspections();
  const selected = allRecords.find(r => String(r.id) === String(recordId));
  if (!selected) return;
  // View must always open the latest saved version for this unit and inspection type.
  const candidates = allRecords.filter(r =>
    String(r.apt) === String(selected.apt) &&
    (String(r.typeId) === String(selected.typeId) ||
      (selected.type && r.type === selected.type) ||
      (selected.typeNum && String(r.typeNum) === String(selected.typeNum)))
  );
  const record = candidates.sort((a, b) => {
    const ad = new Date(a.date || a.createdAt || 0).getTime();
    const bd = new Date(b.date || b.createdAt || 0).getTime();
    return bd - ad;
  })[0] || selected;
  try { await inspEnsureRecordItems(record); }
  catch (error) { inspShowToast('Could not load the inspection details.', 'error'); console.error(error); return; }
  inspCurrentUnit = INSP_DEMO_UNITS.find(u => u.apt === record.apt) || { apt: record.apt, building: record.building, floor: record.floor };
  inspCurrentType = INSP_INSPECTION_TYPES.find(t => String(t.id) === String(record.typeId))
    || INSP_INSPECTION_TYPES.find(t => t.name === record.type || String(t.num) === String(record.typeNum));
  if (!inspCurrentType && record.items?.length) {
    inspCurrentType = { id: record.typeId, name: record.type || 'Inspection', num: record.typeNum || '', items: record.items.map(item => item.description) };
  }
  if (!inspCurrentType) return;
  inspChecklistItems = (record.items || []).map(item => ({ status:item.status, comment:item.comment || '', photos:item.photos || [] }));
  if (!fromUnitView && !fromReport) {
    const tab = document.querySelector('.tab-main[onclick*="inspections"]');
    if (tab) switchMainTab('inspections', tab);
    inspShowTab('new');
  }
  window.inspLastSummaryRecord = record;
  if (fromUnitView) inspHideUnitDetailsForSummary();
  inspShowSummary(record);
  setTimeout(() => inspShowSummaryPopup(), 0);
}

// PUNCH LIST
function inspFindPunchInspection(item) {
  const records = inspGetInspections();
  const directId = String(item.inspectionId || '');
  const generatedId = String(item.id || '');
  const directRecord = records.find(r =>
    (directId && String(r.id) === directId) ||
    (generatedId && generatedId.startsWith(`inspection-${r.id}-`))
  );
  if (directRecord && normalizePunchStatus(item.status) !== 'Closed') return directRecord;
  const historyId = Array.isArray(item.history) ? [...item.history].reverse().find(h => h.inspectionId)?.inspectionId : null;
  if (historyId) {
    const byId = records.find(r => String(r.id) === String(historyId));
    if (byId) return byId;
  }
  const apt = String(item.location || item.apt || '');
  const typeNum = String(item.typeNum || '');
  const description = String(item.description || item.title || '').replace(/^\s*\d+\.\s*/, '').trim().toLowerCase();
  const candidates = records.filter(r => String(r.apt) === apt && (!typeNum
    ? (!directRecord?.typeId || String(r.typeId) === String(directRecord.typeId))
    : String(r.typeNum) === typeNum));
  if (normalizePunchStatus(item.status) === 'Closed') {
    return candidates.slice().sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))[0] || null;
  }
  return candidates.slice().reverse().find(r => (r.items || []).some(i => String(i.description || '').trim().toLowerCase() === description && i.status === 'FAIL')) || candidates[candidates.length - 1] || null;
}

function inspOpenPunchInspection(recordId) {
  if (!recordId) return;
  inspOpenInspectionRecord(recordId);
}

function inspOpenPunchItem(itemId, mode) {
  const item = Array.isArray(punchlist) ? punchlist.find(entry => String(entry.id) === String(itemId)) : null;
  if (!item) return;
  const record = inspFindPunchInspection(item);
  if (!record) {
    inspShowToast('The related inspection could not be found.', 'error');
    return;
  }
  if (mode === 'resume') {
    inspRetakeInspection(item.location || item.apt || record.apt, item.typeId || record.typeId);
  } else {
    inspOpenInspectionRecord(record.id);
  }
}

function inspLoadPunchList() {
  const unitFilter = window.inspHistoryUnitFilter ? String(window.inspHistoryUnitFilter) : '';
  const query = (document.getElementById('insp-punch-unit-search')?.value || '').trim().toLowerCase();
  const punchHistory = Array.isArray(punchlist) ? punchlist.filter(item =>
    !isLocallyDeletedPunch(item) &&
    (!unitFilter || String(item.location || item.apt || '') === unitFilter) &&
    (!query || String(item.location || item.apt || '').toLowerCase().startsWith(query))
  ) : [];
  const allFails = punchHistory.length ? punchHistory.map(item => {
    const linkedInspection = inspFindPunchInspection(item);
    const itemHistory = parsePunchHistory(item.history);
    const historyInspectionId = [...itemHistory].reverse().find(entry => entry?.inspectionId)?.inspectionId || '';
    const history = itemHistory.length ? itemHistory : (linkedInspection ? [{
      action: 'created',
      date: linkedInspection.date || linkedInspection.createdAt || new Date().toISOString(),
      inspectionId: linkedInspection.id,
      inspector: linkedInspection.inspector || item.assignee || ''
    }] : []);
    return {
    id: item.id,
    apt: item.location || item.apt || '',
    building: item.building || '',
    type: item.type || 'Punch Item',
    typeNum: item.typeNum || '',
    inspector: item.assignee || item.inspector || '',
    date: item.createdAt || item.date || new Date().toISOString(),
    closedAt: item.closedAt || null,
    status: normalizePunchStatus(item.status),
    description: item.description || item.title || '',
    comment: item.comment || '',
    priority: item.priority || 'High',
    typeId: item.typeId || linkedInspection?.typeId || '',
    photoCount: item.photoCount || (item.photos || []).length,
    photos: item.photos || [],
    history,
    inspectionId: linkedInspection?.id || item.inspectionId || historyInspectionId || null
    };
  }) : [];

  const container = document.getElementById('insp-punchlist-body');
  if (!container) return;

  if (allFails.length === 0) {
    container.innerHTML = `
      <div class="insp-empty">
        <div class="insp-empty-icon">✅</div>
  <h3>No failures recorded</h3>
  <p>All inspections passed</p>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#fef2f2;border-bottom:1px solid #fca5a5">
  <strong style="color:#dc2626">${allFails.length} punch item(s) in history</strong>
      <button onclick="(function(){const b=document.querySelector('.tab-main[onclick*=\'punch\']');if(b){switchMainTab('punch',b);setTimeout(punchShowInspectionFails,200);}})()" style="font-size:11px;padding:4px 10px;background:#dc2626;color:#fff;border:none;border-radius:5px;cursor:pointer;">Ver en Punch List →</button>
    </div>
    ${allFails.map((f, i) => `
      <div class="insp-row" style="${i % 2 === 0 ? '' : 'background:#f8fafc'}">
        <div>
          <div style="font-weight:700;color:#dc2626">❌ ${f.apt}</div>
          <div style="font-size:12px;color:#64748b">${f.building}</div>
        </div>
        <div style="flex:1">
           <div style="font-size:13px;font-weight:600">${f.typeNum ? `${f.typeNum}. ` : ''}${f.type} <span class="insp-badge ${f.status === 'Closed' ? 'insp-badge-pass' : 'insp-badge-fail'}">${f.status === 'Closed' ? 'COMPLETED' : 'HIGH PRIORITY'}</span></div>
          <div style="font-size:12px;color:#64748b;margin-top:2px">Inspector: ${f.inspector || 'Unknown'}</div>
          <div style="font-size:13px;margin-top:2px">${window.esc(f.description)}</div>
          <div style="font-size:12px;color:#64748b;margin-top:2px">💬 ${window.esc(f.comment)}</div>
          ${f.photoCount > 0 ? `<div style="font-size:12px;color:#64748b">📷 ${f.photoCount} foto(s)</div>` : ''}
          <div style="font-size:12px;color:#64748b;margin-top:3px">${formatPunchHistory(f)}</div>
        </div>
         <div style="font-size:12px;color:#64748b;white-space:nowrap">Created: ${new Date(f.date).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}${f.closedAt ? `<br>Closed: ${new Date(f.closedAt).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}` : ''}</div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end">
          ${f.inspectionId ? `<button class="insp-btn insp-btn-sm insp-btn-outline" onclick='inspOpenPunchItem(${JSON.stringify(f.id)},"view")'>View</button><button class="insp-btn insp-btn-sm insp-btn-outline" onclick='inspOpenPunchItem(${JSON.stringify(f.id)},"resume")'>Resume</button>` : ''}
        </div>
      </div>
    `).join('')}
  `;
  translatePageText(localStorage.getItem('cfg_language') || 'en');
}

function inspOpenPunchPhotos(apt, typeNum) {
  const record = inspGetInspections().filter(r => r.apt === apt && String(r.typeNum) === String(typeNum)).pop();
  const photos = (record?.items || []).flatMap(item => item.status === 'FAIL' ? (item.photos || []) : []);
  if (photos.length) inspOpenPhotoViewer(photos, 0);
}

// TOAST
function inspShowToast(msg, type = 'success') {
  const t = document.getElementById('insp-toast');
  if (!t) return;
  clearTimeout(window.inspToastTimer);
  t.textContent = msg;
  t.className = `insp-toast insp-toast-${type}`;
  t.classList.remove('insp-toast-hide');
  t.style.transform = 'translateY(0)';
  t.style.opacity = '1';
  window.inspToastTimer = setTimeout(() => {
    t.classList.add('insp-toast-hide');
    t.style.transform = 'translateY(100px)';
    t.style.opacity = '0';
  }, 4000);
}

// INIT - run when tab becomes active
document.addEventListener('DOMContentLoaded', function() {
  initializeLanguage();
  inspApplyCurrentInspector();
  // Keep the inspection module in the same content flow as the other main tabs.
  const inspectionsPanel = document.getElementById('inspectionsTab');
  const contentPanel = document.querySelector('.content');
  if (inspectionsPanel && contentPanel) contentPanel.appendChild(inspectionsPanel);
  // Initialize the inspection module step
  inspGoStep(1);
  const inspectionSearch = document.getElementById('insp-unit-search');
  if (inspectionSearch) {
    inspectionSearch.addEventListener('input', function() { inspSearchUnits(this.value); });
    inspectionSearch.addEventListener('keyup', function() { inspSearchUnits(this.value); });
  }
  document.addEventListener('click', function(event) {
    if (event.target.matches('#insp-fail-list .insp-photo-thumb')) inspOpenPhotoFromGroup(event.target);
  });
  const inspectionsTabButton = document.querySelector('.tab-main[onclick*="inspections"]');
  const innerTabs = document.querySelector('#inspectionsTab .insp-tabs');
  if (innerTabs && !innerTabs.querySelector('[data-insp-report-tab]')) {
    const reportButton = document.createElement('button'); reportButton.type = 'button'; reportButton.className = 'insp-tab'; reportButton.dataset.inspReportTab = '1'; reportButton.textContent = '📈 Report'; reportButton.setAttribute('onclick', "inspShowTab('report')"); innerTabs.appendChild(reportButton);
    const reportPanel = document.createElement('div'); reportPanel.id = 'insp-tab-report'; reportPanel.className = 'insp-card'; reportPanel.style.display = 'none'; reportPanel.innerHTML = '<div class="insp-card-header"><h3>Inspection Report</h3><button title="Return" aria-label="Return" class="insp-btn insp-btn-sm insp-btn-outline insp-icon-nav" onclick="inspShowTab(\'new\');inspGoStep(1)">↩</button><button title="Close" aria-label="Close" class="insp-btn insp-btn-sm insp-btn-outline insp-icon-nav" onclick="switchMainTab(\'dashboard\',document.querySelector(\'.tab-main[onclick*=dashboard]\'))">×</button></div><div data-report-body></div>'; document.getElementById('inspectionsTab').appendChild(reportPanel);
  }
  if (inspectionsTabButton) inspectionsTabButton.textContent = '⚡ Inspections';
});
document.addEventListener('change', function(event) {
  const report = document.getElementById('insp-tab-report');
  if (report && report.style.display !== 'none' && !event.target.closest('#insp-tab-report')) inspLoadReport();
});
document.addEventListener('DOMContentLoaded', function() {
  const inspectionFailuresButton = document.getElementById('punchInspFailsBtn');
  if (inspectionFailuresButton) inspectionFailuresButton.textContent = '🔍 Inspection Failures';
  const inspectionFailuresTitle = document.querySelector('#punchInspFailsPanel strong');
  if (inspectionFailuresTitle) inspectionFailuresTitle.textContent = 'Inspection Failures — Pending';
});
// Report refreshes on tab entry and filter changes. Avoid a polling loop here:
// it repeatedly rebuilt the report while the user was reading or typing.
