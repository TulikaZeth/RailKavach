import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'alert_model.dart';
import 'alert_service.dart';

class RailwayKavachPage extends StatefulWidget {
  const RailwayKavachPage({Key? key}) : super(key: key);

  @override
  State<RailwayKavachPage> createState() => _RailwayKavachPageState();
}

class _RailwayKavachPageState extends State<RailwayKavachPage> {
  int _currentIndex = 0;
  List<AlertModel> _currentAlerts = [];
  List<AlertModel> _pastAlerts = [];
  bool _isLoading = true;
  String? _errorMessage;
  
  final AlertService _alertService = AlertService();
  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  @override
  void initState() {
    super.initState();
    _initializeNotifications();
    _fetchAlerts();
  }

  Future<void> _initializeNotifications() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    final DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
          requestSoundPermission: false,
          requestBadgePermission: false,
          requestAlertPermission: false,
        );

    final InitializationSettings initializationSettings =
        InitializationSettings(
          android: initializationSettingsAndroid,
          iOS: initializationSettingsIOS,
        );

    await flutterLocalNotificationsPlugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: (
        NotificationResponse notificationResponse,
      ) {
        // Handle notification tapped logic here
      },
    );
  }

  Future<void> _showNotification(AlertModel alert) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
          'railway_kavach_channel',
          'Railway Kavach Alerts',
          channelDescription:
              'Notifications for animal detection near railway tracks',
          importance: Importance.high,
          priority: Priority.high,
          ticker: 'ticker',
        );

    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
    );

    await flutterLocalNotificationsPlugin.show(
      DateTime.now().millisecond, // Unique ID
      'Animal Detected: ${alert.animalName}',
      'Camera ${alert.cameraNumber} - ${alert.alertSeverity.toUpperCase()} severity',
      platformChannelSpecifics,
    );
  }

  Future<void> _fetchAlerts() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final alerts = await _alertService.getAlerts();
      
      // If successful, show a notification for any new active alerts
      if (alerts.isNotEmpty) {
        final newActiveAlerts = alerts.where((alert) => 
          !alert.isProcessed && 
          !_currentAlerts.any((existing) => existing.id == alert.id)
        ).toList();
        
        // Show notification for first new alert if any
        if (newActiveAlerts.isNotEmpty) {
          _showNotification(newActiveAlerts.first);
        }
      }
      
      setState(() {
        _currentAlerts = alerts.where((alert) => !alert.isProcessed).toList();
        _pastAlerts = alerts.where((alert) => alert.isProcessed).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load alerts: $e';
        _isLoading = false;
      });
    }
  }

  // Process an alert (mark as acknowledged)
  Future<void> _processAlert(AlertModel alert) async {
    if (alert.id == null) return;
    
    try {
      setState(() {
        _isLoading = true;
      });
      
      await _alertService.updateAlertStatus(alert.id!, 'acknowledged');
      
      // Refresh alerts after updating
      _fetchAlerts();
      
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to process alert: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Railway Kavach'),
        backgroundColor: Colors.blue[800],
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchAlerts,
            tooltip: 'Refresh alerts',
          ),
        ],
      ),
      body: Column(
        children: [
          // Common text below the app bar
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              'New Delhi Railway Station',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.blue[800],
              ),
            ),
          ),
          // Error message if any
          if (_errorMessage != null)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red),
              ),
            ),
          // Loading indicator
          if (_isLoading)
            const Expanded(
              child: Center(
                child: CircularProgressIndicator(),
              ),
            )
          else
            // Content
            Expanded(
              child: _currentIndex == 0
                  ? _buildCurrentAlertsTab()
                  : _buildPastAlertsTab(),
            ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: [
          BottomNavigationBarItem(
            icon: Badge(
              label: Text(_currentAlerts.length.toString()),
              isLabelVisible: _currentAlerts.isNotEmpty,
              child: const Icon(Icons.warning_amber_rounded),
            ),
            label: 'Current Alerts',
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.history),
            label: 'Past Alerts',
          ),
        ],
      ),
      // For demo purposes only - remove in production
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Show a snackbar reminding this is just for demo
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Refreshing alerts...'),
              duration: Duration(seconds: 1),
            ),
          );
          _fetchAlerts();
        },
        tooltip: 'Refresh Alerts',
        child: const Icon(Icons.refresh),
      ),
    );
  }

  Widget _buildCurrentAlertsTab() {
    if (_currentAlerts.isEmpty) {
      return const Center(
        child: Text(
          'No current alerts',
          style: TextStyle(fontSize: 18, color: Colors.grey),
        ),
      );
    }

    return ListView.builder(
      itemCount: _currentAlerts.length,
      itemBuilder: (context, index) {
        final alert = _currentAlerts[index];
        return _buildAlertCard(alert, true);
      },
    );
  }

  Widget _buildPastAlertsTab() {
    if (_pastAlerts.isEmpty) {
      return const Center(
        child: Text(
          'No past alerts',
          style: TextStyle(fontSize: 18, color: Colors.grey),
        ),
      );
    }

    return ListView.builder(
      itemCount: _pastAlerts.length,
      itemBuilder: (context, index) {
        final alert = _pastAlerts[index];
        return _buildAlertCard(alert, false);
      },
    );
  }

  Widget _buildAlertCard(AlertModel alert, bool isCurrent) {
    // Determine severity color
    Color severityColor;
    switch (alert.alertSeverity) {
      case 'critical':
        severityColor = Colors.red[700]!;
        break;
      case 'high':
        severityColor = Colors.orange[700]!;
        break;
      case 'medium':
        severityColor = Colors.amber[600]!;
        break;
      case 'low':
        severityColor = Colors.blue[600]!;
        break;
      default:
        severityColor = Colors.grey[700]!;
    }

    // Background color for card
    Color cardColor = isCurrent 
        ? Color.lerp(Colors.white, severityColor, 0.1)! 
        : Colors.white;

    // Get alert type display text
    String alertTypeDisplay = alert.alertType.replaceAll('_', ' ').capitalize();

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: isCurrent ? 4 : 2,
      color: cardColor,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            decoration: BoxDecoration(
              color: severityColor,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(4),
                topRight: Radius.circular(4),
              ),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            width: double.infinity,
            child: Text(
              '${alert.alertSeverity.toUpperCase()} SEVERITY',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
          ListTile(
            title: Text(
              '${alertTypeDisplay}: ${alert.animalName}',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: isCurrent ? severityColor : Colors.black,
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Text(
                  DateFormat('MMM dd, yyyy • HH:mm:ss').format(alert.createdAt),
                ),
                const SizedBox(height: 4),
                Text('Status: ${alert.status.replaceAll('_', ' ').capitalize()}'),
              ],
            ),
            trailing: isCurrent
                ? IconButton(
                    icon: const Icon(Icons.check_circle_outline),
                    color: Colors.green,
                    onPressed: () => _processAlert(alert),
                    tooltip: 'Mark as processed',
                  )
                : null,
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Camera: ${alert.cameraNumber}'),
                          const SizedBox(height: 4),
                          Text(
                            'Railway Section: ${alert.distanceFromStation}',
                          ),
                          if (alert.affectedTrains.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              'Affected Trains: ${alert.affectedTrains.length}',
                            ),
                          ],
                          if (alert.notes != null && alert.notes!.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Text(
                              'Notes: ${alert.notes}',
                              style: const TextStyle(
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    if (alert.imageUrl.isNotEmpty)
                      Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey.shade300),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            alert.imageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Center(
                                child: Icon(
                                  alert.animalType == 'elephant' ? Icons.pets : 
                                  alert.animalType == 'deer' ? Icons.nature : 
                                  Icons.broken_image,
                                  size: 40,
                                  color: Colors.grey,
                                ),
                              );
                            },
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return Center(
                                child: CircularProgressIndicator(
                                  value: loadingProgress.expectedTotalBytes != null
                                      ? loadingProgress.cumulativeBytesLoaded /
                                          loadingProgress.expectedTotalBytes!
                                      : null,
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                  ],
                ),
                if (isCurrent) ...[
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _processAlert(alert),
                          icon: const Icon(Icons.check_circle),
                          label: const Text('Process Alert'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton.icon(
                        onPressed: () {
                          // Open detailed view or show more information
                          // This could navigate to a detail page
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Alert details page coming soon'),
                            ),
                          );
                        },
                        icon: const Icon(Icons.info_outline),
                        label: const Text('Details'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}