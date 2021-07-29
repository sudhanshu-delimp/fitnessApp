const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const dbConnection = require("../utils/dbConnection");
const helper_general = require("../helpers/general");
const helper_equipment = require("../helpers/equipment");

exports.addEquipmentPage = async (req, res, next) => {
    res.render('equipment/add', {
        title: 'Welcome to Fitness | Add Equipment',
        page_title:'Add Equipment'
    });
}

exports.equipmentListingPage = async (req, res, next) => {
    res.render('equipment/listing', {
        title: 'Welcome to Fitness | Manage Equipment',
        page_title:'Manage Equipment'
    });
}

exports.getEquipments = async (req, res, next) => {
  let equipments = [];
  let totalFiltered = 0;
  let data = [];
  await helper_equipment.getEquipments(req).then(row=>{
    equipments = row;
  },err=>{
    res.json(err);
  });
  await helper_equipment.getEquipmentsCount(req).then(row=>{
    totalFiltered = row;
  },err=>{
    res.json(err);
  });
  if(totalFiltered > 0){
    equipments.forEach((equipment,index) =>{
      var nestedData = {};
      nestedData['sn'] = helper_general.getSerialNumber(req.body.start, index);
      nestedData['title'] = equipment.title;
      nestedData['image'] = '<img src="/uploads/equipment/thumb/'+equipment.image+'" class="img-circle" alt="">';
      nestedData['qr_code'] = '<img src="/uploads/equipment/qr_code/'+equipment.qr_code+'" class="img-circle" alt="">';
      nestedData['options'] = '<div class="btn-group">';
      nestedData['options'] += '<button class="btn btn-secondary btn-sm main-btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span>Action</span><span class="caret"></span></button>';
      nestedData['options'] += '<ul class="dropdown-menu">';
      nestedData['options'] += '<li><a onclick="editData(this)" data-id = "'+equipment.id+'" class="dropdown-item main-text" href="#"><i class="fa fa-fw fa-pencil"></i> Edit</a></li>';
      nestedData['options'] += '<li><a onclick="deleteData(this)" data-id = "'+equipment.id+'" class="dropdown-item main-text" href="#"><i class="fa fa-fw fa-trash"></i> Delete</a></li>';
      nestedData['options'] += '<li><a download="'+equipment.title+'" data-id = "'+equipment.id+'" class="dropdown-item main-text" href="/uploads/equipment/qr_code/'+equipment.qr_code+'"><i class="fa fa-qrcode"></i> Download QR Code</a></li>';
      nestedData['options'] += '</ul>';
      nestedData['options'] += '</div>';
      data.push(nestedData);
    });

  }
  let json_data = {
    "draw" :parseInt(req.body.draw),
    "recordsTotal" :parseInt(totalFiltered),
    "recordsFiltered" :parseInt(totalFiltered),
    "data" :data
  }
  res.json(json_data);
}

exports.deleteEquipment = async (req, res, next) => {
  var id = req.body.id;
  await helper_equipment.getEquipmentDetail(id).then(async (row)=>{
    res.render('equipment/equipment-delete', {
        equipment: row
    });
  },err=>{
    res.render('equipment/equipment-delete', {
        error: err
    });
  });
}
