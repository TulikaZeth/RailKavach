class AlertModel {
  final String? id;
  final String eventId;
  final String cameraId;
  final String alertType;
  final String alertSeverity;
  final String status;
  final List<String> affectedTrains;
  final List<String> notifiedStations;
  final String? notes;
  final DateTime createdAt;
  final String animalType; // From the linked detection event
  final String imageUrl; // From the linked detection event
  final Map<String, dynamic>? camera; // Populated camera data

  AlertModel({
    this.id,
    required this.eventId,
    required this.cameraId,
    required this.alertType,
    required this.alertSeverity,
    required this.status,
    required this.affectedTrains,
    required this.notifiedStations,
    this.notes,
    required this.createdAt,
    required this.animalType,
    required this.imageUrl,
    this.camera,
  });

  // Convert from JSON (for receiving from backend)
  factory AlertModel.fromJson(Map<String, dynamic> json) {
  // Handle populated event data
  String animalType = 'unknown';
  String imageUrl = '';
  String eventId = '';

  if (json.containsKey('eventId')) {
    if (json['eventId'] is Map<String, dynamic>) {
      // Populated event reference
      final eventData = json['eventId'] as Map<String, dynamic>;
      animalType = eventData['animalType'] ?? 'unknown';
      imageUrl = eventData['imageUrl'] ?? '';
      eventId = eventData['_id']?.toString() ?? '';
    } else if (json['eventId'] is String) {
      // String ID reference
      eventId = json['eventId'].toString();
    } else {
      throw Exception('Invalid type for eventId: ${json['eventId'].runtimeType}');
    }
  }

  // Handle populated camera data
  String cameraId = '';
  Map<String, dynamic>? cameraData;

  if (json.containsKey('camera')) {
    if (json['camera'] is Map<String, dynamic>) {
      // Populated camera reference
      cameraData = json['camera'] as Map<String, dynamic>;
      cameraId = cameraData['_id']?.toString() ?? '';
    } else if (json['camera'] is String) {
      // String ID reference
      cameraId = json['camera'].toString();
    } else {
      throw Exception('Invalid type for camera: ${json['camera'].runtimeType}');
    }
  }

  // Handle populated affectedTrains
  List<String> affectedTrains = [];
  if (json.containsKey('affectedTrains')) {
    if (json['affectedTrains'] is List) {
      affectedTrains = (json['affectedTrains'] as List).map((train) {
        if (train is Map<String, dynamic>) {
          return train['trainNumber']?.toString() ?? '';
        } else if (train is String) {
          return train;
        } else {
          throw Exception('Invalid type for affectedTrain: ${train.runtimeType}');
        }
      }).toList();
    } else {
      throw Exception('Invalid type for affectedTrains: ${json['affectedTrains'].runtimeType}');
    }
  }

  // Handle populated notifiedStations
  List<String> notifiedStations = [];
  if (json.containsKey('notifiedStations')) {
    if (json['notifiedStations'] is List) {
      notifiedStations = (json['notifiedStations'] as List).map((station) {
        if (station is Map<String, dynamic>) {
          return station['stationCode']?.toString() ?? '';
        } else if (station is String) {
          return station;
        } else {
          throw Exception('Invalid type for notifiedStation: ${station.runtimeType}');
        }
      }).toList();
    } else {
      throw Exception('Invalid type for notifiedStations: ${json['notifiedStations'].runtimeType}');
    }
  }

  return AlertModel(
    id: json['_id']?.toString(),
    eventId: eventId,
    cameraId: cameraId,
    alertType: json['alertType'] ?? 'animal_detected',
    alertSeverity: json['alertSeverity'] ?? 'medium',
    status: json['status'] ?? 'active',
    affectedTrains: affectedTrains,
    notifiedStations: notifiedStations,
    notes: json['notes']?.toString(),
    createdAt: json['createdAt'] != null
        ? DateTime.parse(json['createdAt'])
        : DateTime.now(),
    animalType: animalType,
    imageUrl: imageUrl,
    camera: cameraData,
  );
}

  // Convert to JSON (for sending to backend)
  Map<String, dynamic> toJson() {
    return {
      'eventId': eventId,
      'camera': cameraId,
      'alertType': alertType,
      'alertSeverity': alertSeverity,
      'status': status,
      'affectedTrains': affectedTrains,
      'notifiedStations': notifiedStations,
      'notes': notes,
    };
  }

  // Create a copy with updated properties
  AlertModel copyWith({
    String? id,
    String? eventId,
    String? cameraId,
    String? alertType,
    String? alertSeverity,
    String? status,
    List<String>? affectedTrains,
    List<String>? notifiedStations,
    String? notes,
    DateTime? createdAt,
    String? animalType,
    String? imageUrl,
    Map<String, dynamic>? camera,
  }) {
    return AlertModel(
      id: id ?? this.id,
      eventId: eventId ?? this.eventId,
      cameraId: cameraId ?? this.cameraId,
      alertType: alertType ?? this.alertType,
      alertSeverity: alertSeverity ?? this.alertSeverity,
      status: status ?? this.status,
      affectedTrains: affectedTrains ?? this.affectedTrains,
      notifiedStations: notifiedStations ?? this.notifiedStations,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
      animalType: animalType ?? this.animalType,
      imageUrl: imageUrl ?? this.imageUrl,
      camera: camera ?? this.camera,
    );
  }

  // Helper getters for UI display
  String get cameraNumber {
    if (camera != null && camera!.containsKey('cameraId')) {
      return camera!['cameraId'];
    }
    return 'Camera #${cameraId.substring(0, 6)}';
  }

  String get distanceFromStation {
    if (camera != null && camera!.containsKey('railwaySection')) {
      return camera!['railwaySection'];
    }
    return 'Unknown';
  }

  String get animalName => animalType.replaceAll('_', ' ').capitalize();

  bool get isProcessed => status != 'active';
}

// Extension method to capitalize strings
extension StringExtension on String {
  String capitalize() {
    return this.isNotEmpty ? '${this[0].toUpperCase()}${this.substring(1)}' : '';
  }
}