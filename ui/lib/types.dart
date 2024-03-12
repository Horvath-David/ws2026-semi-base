import 'package:flutter/material.dart';

class PageEntry {
  final Widget mainWidget;
  final NavigationRailDestination navRailEntry;

  const PageEntry({
    required this.mainWidget,
    required this.navRailEntry,
  });
}
