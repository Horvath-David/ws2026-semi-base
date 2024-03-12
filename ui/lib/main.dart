import 'package:euroskills_baseproject/homepage.dart';
import 'package:euroskills_baseproject/types.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

void main() {
  runApp(const App());
}

class App extends StatefulWidget {
  const App({super.key});

  @override
  State<App> createState() => _AppState();
}

const pages = [
  PageEntry(
    navRailEntry: NavigationRailDestination(
      icon: Icon(Icons.home_outlined),
      selectedIcon: Icon(Icons.home),
      label: Text("Home"),
    ),
    mainWidget: HomePage(),
  ),
  PageEntry(
    navRailEntry: NavigationRailDestination(
      icon: Icon(Icons.add_circle_outline),
      selectedIcon: Icon(Icons.add_circle),
      label: Text("Counter"),
    ),
    mainWidget: CounterPage(),
  ),
];

var setActionButton = (Widget? actionButton) {};

class _AppState extends State<App> {
  var _selectedIndex = 0;
  Widget? floatingActionButton;

  @override
  void initState() {
    setActionButton = (Widget? actionButton) {
      SchedulerBinding.instance.addPostFrameCallback((timeStamp) {
        setState(() => floatingActionButton = actionButton);
      });
    };
    super.initState();
  }

  void selectPage(i) {
    setState(() => _selectedIndex = i);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EuroSkills Semifinals',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: Scaffold(
        body: Flex(
          direction: Axis.horizontal,
          children: [
            NavigationRail(
              backgroundColor: Theme.of(context).focusColor,
              extended: true,
              leading: const Text("EuroSkills"),
              destinations: pages.map((e) => e.navRailEntry).toList(),
              selectedIndex: _selectedIndex,
              onDestinationSelected: (i) => selectPage(i),
            ),
            Expanded(
              child: pages[_selectedIndex].mainWidget,
            )
          ],
        ),
        floatingActionButton: floatingActionButton,
      ),
    );
  }
}
