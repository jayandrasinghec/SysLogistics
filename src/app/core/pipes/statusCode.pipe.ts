import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'statusCodefilter',
    pure: false
})
export class StatusCodeFilterPipe implements PipeTransform {
    transform(items: any[]): any {
        if (!items ) {
            return items;
        }
        const itemsArr =  items.filter((item) => {
              if (item.statusCode === undefined || item.statusCode === null ) {
                return item;
              } else if (item && item.statusCode  && item.statusCode !== 'D') {
                return item;
              }
        }   );
       // console.log('statusCodefilter  ', itemsArr);
        return itemsArr;
    }
}
