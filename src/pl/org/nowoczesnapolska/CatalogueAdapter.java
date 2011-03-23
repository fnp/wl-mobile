package pl.org.nowoczesnapolska;

import java.util.ArrayList;

import android.app.Activity;
import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.BaseAdapter;
import android.widget.TextView;

class CatalogueAdapter extends BaseAdapter {
	private ArrayList<CatalogueEntry> items;
	private Context ctx;
	
        public CatalogueAdapter(Context context, int textViewResourceId, ArrayList<CatalogueEntry> items) {
        	this.items = items;
        	this.ctx = context;
        }

		@Override
		public int getCount() {
			// TODO Auto-generated method stub
			return items.size();
		}
		@Override
		public Object getItem(int position) {
			// TODO Auto-generated method stub
			return items.get(position);
		}
		@Override
		public long getItemId(int position) {
			return items.get(position).getId();
		}

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
                View v = convertView;
                if (v == null) {
                	LayoutInflater vi = (LayoutInflater)ctx.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
                    v = vi.inflate(R.layout.catalogue_row, null);
                }
                CatalogueEntry o = items.get(position);
                if (o != null) {
                		Log.d("not null", "not null");
                        TextView tt = (TextView) v.findViewById(R.id.id);
                        TextView bt = (TextView) v.findViewById(R.id.name);
                        if (tt != null) {
                              tt.setText("Name: "+o.getName());                            }
                        if(bt != null){
                              bt.setText("Type: "+ o.getType());
                        }
                }
                Log.d("dalej", "dalej");
                return v;
        }
}