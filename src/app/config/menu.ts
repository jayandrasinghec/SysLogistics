

export const MENU_ITEMS: any[] = [
  {
    title: 'Menu1',
    icon: 'shopping-cart-outline',
    link: '/pages/dashboard',
    home: true,
  },
  {
    title: 'Menu2',
    icon: 'layout-outline',
    children: [
      {
        title: 'Stepper',
        link: '/pages/layout/stepper',
      }
    ],
  }
];
