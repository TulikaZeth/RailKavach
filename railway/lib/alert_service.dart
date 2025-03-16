import 'dart:convert';
import 'package:http/http.dart' as http;
import 'alert_model.dart';

class AlertService {
  final String baseUrl;
  
  AlertService({this.baseUrl = 'https://9wpbn5ns-3000.inc1.devtunnels.ms/api'}); // Use your actual API URL

  Future<List<AlertModel>> getAlerts() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/alerts'));
      
      if (response.statusCode == 200) {
        final List<dynamic> alertsJson = json.decode(response.body);
        return alertsJson.map((json) => AlertModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load alerts: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching alerts: $e');
    }
  }

  Future<AlertModel> createAlert(AlertModel alert) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/alerts'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(alert.toJson()),
      );
      
      if (response.statusCode == 201) {
        return AlertModel.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to create alert: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error creating alert: $e');
    }
  }

  Future<AlertModel> updateAlertStatus(String alertId, String status) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/alerts/$alertId'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'status': status}),
      );
      
      if (response.statusCode == 200) {
        return AlertModel.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to update alert: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error updating alert: $e');
    }
  }
}